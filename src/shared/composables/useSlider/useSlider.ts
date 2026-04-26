import type { UseSliderOptions, UseSliderReturn } from './useSlider.types'

import { useSwipe } from '@/shared/composables/useSwipe'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Composable для логики слайдера.
 * Навигация, autoplay, drag, snap, trackStyle, ResizeObserver.
 */
function useSlider(options: UseSliderOptions): UseSliderReturn {
	const {
		itemCount,
		animation = () => 'slide',
		isAutoplay = () => false,
		autoplayInterval = () => 4000,
		isLoop = () => true,
		isVertical = () => false,
		initialIndex = () => 0,
		snapThreshold = 20,
		onChange,
		onNext,
		onPrev,
	} = options

	const currentIndex = ref(clampIndex(initialIndex()))
	const viewportRef = ref<HTMLElement | null>(null)
	const dragOffset = ref(0)
	let autoplayTimer: ReturnType<typeof setInterval> | null = null
	let resizeObserver: ResizeObserver | null = null

	/** Клампинг индекса в допустимый диапазон */
	function clampIndex(index: number): number {
		return Math.max(0, Math.min(index, itemCount() - 1))
	}

	/** Получить размер viewport в зависимости от ориентации */
	function getViewportSize(): number {
		if (!viewportRef.value) return 0
		return isVertical() ? viewportRef.value.clientHeight : viewportRef.value.clientWidth
	}

	/** Snap-логика: решить, переключать слайд или вернуться */
	function handleDragEnd(delta: { main: number; cross: number }): void {
		const viewportSize = getViewportSize()
		if (viewportSize === 0) return
		const offsetPercent = (Math.abs(delta.main) / viewportSize) * 100
		if (offsetPercent < snapThreshold) return
		if (delta.main < 0) goNext()
		else goPrev()
	}

	/** Composable для свайпа */
	const swipe = useSwipe({
		isVertical,
		threshold: 50,
		onDragOffset: (offset: number) => {
			dragOffset.value = offset
		},
		onDragEnd: handleDragEnd,
	})

	/** Стиль трека с учётом смещения при перетаскивании */
	const trackStyle = computed((): Record<string, string> => {
		if (animation() !== 'slide') return {}
		const direction = isVertical() ? 'Y' : 'X'
		const base = currentIndex.value * 100
		const viewportSize = getViewportSize()
		const offsetPercent = viewportSize > 0 ? (dragOffset.value / viewportSize) * 100 : 0
		const styles: Record<string, string> = {
			transform: `translate${direction}(-${base - offsetPercent}%)`,
		}
		if (swipe.isDragging.value) styles.transition = 'none'
		return styles
	})

	/** Переход к слайду */
	function goTo(index: number): void {
		if (index < 0 || index >= itemCount()) return
		currentIndex.value = index
		onChange?.(index)
	}

	/** Следующий слайд */
	function goNext(): void {
		const next = currentIndex.value + 1
		if (next >= itemCount()) {
			if (isLoop()) goTo(0)
			return
		}
		goTo(next)
		onNext?.()
	}

	/** Предыдущий слайд */
	function goPrev(): void {
		const prev = currentIndex.value - 1
		if (prev < 0) {
			if (isLoop()) goTo(itemCount() - 1)
			return
		}
		goTo(prev)
		onPrev?.()
	}

	/** Запуск автопроигрывания */
	function startAutoplay(): void {
		if (!isAutoplay()) return
		autoplayTimer = setInterval(goNext, autoplayInterval())
	}

	/** Пауза автопроигрывания */
	function pauseAutoplay(): void {
		if (autoplayTimer) {
			clearInterval(autoplayTimer)
			autoplayTimer = null
		}
	}

	/** Возобновление автопроигрывания */
	function resumeAutoplay(): void {
		pauseAutoplay()
		startAutoplay()
	}

	watch(isAutoplay, val => {
		if (val) startAutoplay()
		else pauseAutoplay()
	})

	watch(initialIndex, newIndex => {
		currentIndex.value = clampIndex(newIndex)
	})

	watch(itemCount, () => {
		if (currentIndex.value >= itemCount()) {
			currentIndex.value = clampIndex(currentIndex.value)
		}
	})

	onMounted(() => {
		startAutoplay()
		if (viewportRef.value) {
			resizeObserver = new ResizeObserver(() => {
				// viewportSize пересчитывается через getViewportSize() в computed
			})
			resizeObserver.observe(viewportRef.value)
		}
	})

	onBeforeUnmount(() => {
		pauseAutoplay()
		if (resizeObserver) {
			resizeObserver.disconnect()
			resizeObserver = null
		}
	})

	return {
		currentIndex,
		dragOffset,
		isDragging: swipe.isDragging,
		viewportRef,
		trackStyle,
		goTo,
		goNext,
		goPrev,
		pauseAutoplay,
		resumeAutoplay,
		onTouchStart: swipe.onTouchStart,
		onTouchMove: swipe.onTouchMove,
		onTouchEnd: swipe.onTouchEnd,
		onDragStart: swipe.onDragStart,
	}
}

export { useSlider }

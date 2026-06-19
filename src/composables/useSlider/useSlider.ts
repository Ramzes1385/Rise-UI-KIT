/** Composable: логика слайдера (навигация, autoplay, drag, snap) */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSwipe } from '@composables/useSwipe'
import type { UseSliderOptions, UseSliderReturn } from './useSlider.types'

/**
 * Composable для логики слайдера.
 * Навигация, autoplay, drag, snap, trackStyle, ResizeObserver.
 * Поддерживает spaceBetween, slidesPerView, slidesPerGroup.
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
		spaceBetween = () => 0,
		slidesPerView = () => 1,
		slidesPerGroup = () => 1,
		onChange,
		onNext,
		onPrev,
	} = options

	const currentIndex = ref(clampIndex(initialIndex()))
	const viewportRef = ref<HTMLElement | null>(null)
	const dragOffset = ref(0)
	const viewportSizeVal = ref(0)
	let autoplayTimer: ReturnType<typeof setInterval> | null = null
	let resizeObserver: ResizeObserver | null = null

	/** Количество видимых слайдов (минимум 1) */
	function getPerView(): number {
		return Math.max(1, slidesPerView())
	}

	/** Количество слайдов для перелистывания за шаг (минимум 1) */
	function getPerGroup(): number {
		return Math.max(1, slidesPerGroup())
	}

	/** Максимальный индекс с учётом slidesPerView */
	function getMaxIndexValue(): number {
		return Math.max(0, itemCount() - getPerView())
	}

	/** Максимальный индекс (реактивный) */
	const maxIndex = computed(() => getMaxIndexValue())

	/** Количество страниц навигации */
	const pageCount = computed(() => {
		const group = getPerGroup()
		const max = getMaxIndexValue()
		return Math.ceil((max + 1) / group)
	})

	/** Индекс текущей страницы */
	const currentPage = computed(() => {
		const group = getPerGroup()
		return Math.floor(currentIndex.value / group)
	})

	/** Клампинг индекса в допустимый диапазон */
	function clampIndex(index: number): number {
		return Math.max(0, Math.min(index, getMaxIndexValue()))
	}

	/** Получить размер viewport напрямую из DOM */
	function getViewportSize(): number {
		if (!viewportRef.value) return 0
		return isVertical() ? viewportRef.value.clientHeight : viewportRef.value.clientWidth
	}

	/** Обновить реактивный размер viewport */
	function updateViewportSize(): void {
		viewportSizeVal.value = getViewportSize()
	}

	/** Размер одного слайда в пикселях */
	function getSlideSize(): number {
		const vpSize = viewportSizeVal.value
		const perView = getPerView()
		const gap = spaceBetween()
		return (vpSize - (perView - 1) * gap) / perView
	}

	/** Шаг смещения в пикселях (слайд + gap) */
	function getStepSize(): number {
		return getSlideSize() + spaceBetween()
	}

	/** Snap-логика: решить, переключать слайд или вернуться */
	function handleDragEnd(delta: { main: number; cross: number }): void {
		const vpSize = getViewportSize()
		if (vpSize === 0) return
		const offsetPercent = (Math.abs(delta.main) / vpSize) * 100
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
		const perView = getPerView()
		const gap = spaceBetween()
		const vpSize = viewportSizeVal.value

		let basePercent: number
		if (perView === 1 && gap === 0) {
			basePercent = currentIndex.value * 100
		} else {
			const basePx = currentIndex.value * getStepSize()
			basePercent = vpSize > 0 ? (basePx / vpSize) * 100 : currentIndex.value * 100
		}

		const offsetPercent = vpSize > 0 ? (dragOffset.value / vpSize) * 100 : 0
		const styles: Record<string, string> = {
			transform: `translate${direction}(-${basePercent - offsetPercent}%)`,
		}
		if (gap > 0) styles.gap = `${gap}px`
		if (swipe.isDragging.value) styles.transition = 'none'
		return styles
	})

	/** Инлайн-стиль отдельного слайда (ширина) */
	const slideStyle = computed((): Record<string, string> => {
		if (animation() !== 'slide') return {}
		const perView = getPerView()
		const gap = spaceBetween()
		if (perView <= 1 && gap === 0) return {}

		const vpSize = viewportSizeVal.value
		if (vpSize === 0) return {}

		const slideSize = getSlideSize()
		const dimension = isVertical() ? 'height' : 'width'
		return {
			[dimension]: `${slideSize}px`,
			flex: '0 0 auto',
		}
	})

	/** Переход к слайду */
	function goTo(index: number): void {
		const max = getMaxIndexValue()
		if (index < 0 || index > max) return
		currentIndex.value = index
		onChange?.(index)
	}

	/** Следующий слайд (на slidesPerGroup) */
	function goNext(): void {
		const max = getMaxIndexValue()
		const group = getPerGroup()
		const next = currentIndex.value + group
		if (next > max) {
			if (isLoop()) goTo(0)
			return
		}
		goTo(next)
		onNext?.()
	}

	/** Предыдущий слайд (на slidesPerGroup) */
	function goPrev(): void {
		const max = getMaxIndexValue()
		const group = getPerGroup()
		const prev = currentIndex.value - group
		if (prev < 0) {
			if (isLoop()) goTo(max)
			return
		}
		goTo(prev)
		onPrev?.()
	}

	/** Переход к странице навигации */
	function goToPage(page: number): void {
		const group = getPerGroup()
		const targetIndex = page * group
		goTo(clampIndex(targetIndex))
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

	watch(isAutoplay, enabled => {
		if (enabled) startAutoplay()
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
		if (viewportRef.value) {
			updateViewportSize()
			resizeObserver = new ResizeObserver(() => {
				updateViewportSize()
			})
			resizeObserver.observe(viewportRef.value)
		}
		startAutoplay()
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
		slideStyle,
		maxIndex,
		pageCount,
		currentPage,
		goTo,
		goNext,
		goPrev,
		goToPage,
		pauseAutoplay,
		resumeAutoplay,
		onTouchStart: swipe.onTouchStart,
		onTouchMove: swipe.onTouchMove,
		onTouchEnd: swipe.onTouchEnd,
		onDragStart: swipe.onDragStart,
	}
}

export { useSlider }


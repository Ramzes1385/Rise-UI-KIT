/** Composable: логика слайдера (навигация, autoplay, drag, snap) */
import { computed, ref } from 'vue'
import { resolveSliderOptions } from './sliderOptions'
import { useSliderAutoplay } from './useSliderAutoplay'
import { useSliderViewport } from './useSliderViewport'
import { useSliderNavigation } from './useSliderNavigation'
import { useSwipe } from '@composables/interaction/useSwipe'
import { buildSlideStyle, buildTrackStyle } from './sliderStyles'
import type { UseSliderOptions, UseSliderReturn } from './types/useSlider.types'

/**
 * Composable для логики слайдера.
 * Навигация, autoplay, drag, snap, trackStyle, ResizeObserver.
 * Поддерживает spaceBetween, slidesPerView, slidesPerGroup.
 */
function useSlider(options: UseSliderOptions): UseSliderReturn {
	const settings = resolveSliderOptions(options)
	const navigation = useSliderNavigation(settings)
	const { viewportRef, viewportSize, measure } = useSliderViewport(settings.isVertical)
	const dragOffset = ref(0)

	/** Snap-логика: решить, переключать слайд или вернуться */
	function handleDragEnd(delta: { main: number; cross: number }): void {
		const vpSize = measure()
		if (vpSize === 0) return
		if ((Math.abs(delta.main) / vpSize) * 100 < settings.snapThreshold) return
		if (delta.main < 0) navigation.goNext()
		else navigation.goPrev()
	}

	const swipe = useSwipe({
		isVertical: settings.isVertical,
		threshold: 50,
		onDragOffset: (offset: number) => {
			dragOffset.value = offset
		},
		onDragEnd: handleDragEnd,
	})

	/** Стили нужны только slide-анимации: в остальных режимах computed не читают индекс, размер и смещение */
	const isSlideMode = (): boolean => settings.animation() === 'slide'

	return {
		...navigation,
		dragOffset,
		isDragging: swipe.isDragging,
		viewportRef,
		trackStyle: computed((): Record<string, string> => {
			if (!isSlideMode()) return {}
			return buildTrackStyle({
				settings,
				currentIndex: navigation.currentIndex.value,
				viewportSize: viewportSize.value,
				dragOffset: dragOffset.value,
				isDragging: swipe.isDragging.value,
			})
		}),
		slideStyle: computed((): Record<string, string> => (isSlideMode() ? buildSlideStyle(settings, viewportSize.value) : {})),
		...useSliderAutoplay(settings, navigation.goNext),
		onTouchStart: swipe.onTouchStart,
		onTouchMove: swipe.onTouchMove,
		onTouchEnd: swipe.onTouchEnd,
		onDragStart: swipe.onDragStart,
		onClickCapture: swipe.onClickCapture,
	}
}

export { useSlider }

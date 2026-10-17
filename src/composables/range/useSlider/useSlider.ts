/** Composable: логика слайдера (навигация, autoplay, drag, snap) */
import { computed, ref } from 'vue'
import { resolveSliderOptions } from './sliderOptions'
import { useSliderAutoplay } from './useSliderAutoplay'
import { useSliderViewport } from './useSliderViewport'
import { useSliderNavigation } from './useSliderNavigation'
import { useDirection } from '@composables/app/useDirection'
import { useSwipe } from '@composables/interaction/useSwipe'
import { buildSlideStyle, buildTrackStyle } from './sliderStyles'
import type { UseSliderOptions, UseSliderReturn } from './types/useSlider.types'

/** Элементы в слайде, с которых мышь не тянет ленту: выделение текста, ползунок видео, поля */
const NO_DRAG_SELECTOR = 'input, textarea, select, video, audio, [contenteditable="true"]'

/** Описание: перетаскивание мышью — только левой кнопкой и не с полей ввода и медиа */
function canStartMouseDrag(event: MouseEvent): boolean {
	if (event.button !== 0) return false
	return !(event.target instanceof Element && event.target.closest(NO_DRAG_SELECTOR))
}

/** Описание: жест листает вперёд: влево в LTR и вправо в RTL (лента идёт справа налево) */
function isForwardSwipe(main: number, isRtl: boolean): boolean {
	return isRtl ? main > 0 : main < 0
}

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
	const { isRtl, sign } = useDirection(() => viewportRef.value)

	/** Snap-логика: решить, переключать слайд или вернуться; жест, у которого поперечное смещение больше продольного, слайд не листает; в RTL вперёд — жест вправо */
	function handleDragEnd(delta: { main: number; cross: number }): void {
		const vpSize = measure()
		if (vpSize === 0 || Math.abs(delta.cross) > Math.abs(delta.main)) return
		if ((Math.abs(delta.main) / vpSize) * 100 < settings.snapThreshold) return
		if (isForwardSwipe(delta.main, settings.isVertical() ? false : isRtl.value)) navigation.goNext()
		else navigation.goPrev()
	}

	const swipe = useSwipe({
		isVertical: settings.isVertical,
		threshold: 50,
		onDragOffset: (offset: number) => (dragOffset.value = offset),
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
				directionSign: settings.isVertical() ? 1 : sign.value,
			})
		}),
		slideStyle: computed((): Record<string, string> => (isSlideMode() ? buildSlideStyle(settings, viewportSize.value) : {})),
		...useSliderAutoplay(settings, { goNext: navigation.goNext, canRotate: () => navigation.maxIndex.value > 0 }),
		onTouchStart: swipe.onTouchStart,
		onTouchMove: swipe.onTouchMove,
		onTouchEnd: swipe.onTouchEnd,
		onTouchCancel: swipe.onTouchCancel,
		onDragStart: (event: MouseEvent): void => {
			if (!canStartMouseDrag(event)) return
			event.preventDefault()
			swipe.onDragStart(event)
		},
		onClickCapture: swipe.onClickCapture,
	}
}

export { useSlider }

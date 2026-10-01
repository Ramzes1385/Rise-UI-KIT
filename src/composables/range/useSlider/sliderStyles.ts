/** Утилиты: стили трека и слайдов слайдера (сдвиг, перетаскивание, gap, размер слайда) */
import { perView } from './sliderOptions'
import type { ResolvedSliderOptions, SliderTrackStyleInput } from './types/useSlider.types'

/** Описание: размер одного слайда в пикселях */
function slideSizePx(settings: ResolvedSliderOptions, viewportSize: number): number {
	const count = perView(settings)
	return (viewportSize - (count - 1) * settings.spaceBetween()) / count
}

/** Описание: сдвиг трека до текущего слайда, % от viewport; размер viewport неизвестен — по 100% на слайд */
function trackBasePercent({ settings, currentIndex, viewportSize }: SliderTrackStyleInput): number {
	const gap = settings.spaceBetween()
	if (perView(settings) === 1 && gap === 0) return currentIndex * 100
	if (viewportSize <= 0) return currentIndex * 100
	const basePx = currentIndex * (slideSizePx(settings, viewportSize) + gap)
	return (basePx / viewportSize) * 100
}

/** Описание: стиль трека с учётом смещения при перетаскивании; не slide-анимация — без стиля */
function buildTrackStyle(input: SliderTrackStyleInput): Record<string, string> {
	const { settings, viewportSize } = input
	if (settings.animation() !== 'slide') return {}
	const direction = settings.isVertical() ? 'Y' : 'X'
	const gap = settings.spaceBetween()
	const offsetPercent = viewportSize > 0 ? (input.dragOffset / viewportSize) * 100 : 0
	const styles: Record<string, string> = {
		transform: `translate${direction}(-${trackBasePercent(input) - offsetPercent}%)`,
	}
	if (gap > 0) styles.gap = `${gap}px`
	if (input.isDragging) styles.transition = 'none'
	return styles
}

/** Описание: инлайн-стиль отдельного слайда (размер по оси прокрутки), когда на экране несколько слайдов или есть gap */
function buildSlideStyle(settings: ResolvedSliderOptions, viewportSize: number): Record<string, string> {
	if (settings.animation() !== 'slide') return {}
	if (perView(settings) <= 1 && settings.spaceBetween() === 0) return {}
	if (viewportSize === 0) return {}
	const dimension = settings.isVertical() ? 'height' : 'width'
	return { [dimension]: `${slideSizePx(settings, viewportSize)}px`, flex: '0 0 auto' }
}

export { buildSlideStyle, buildTrackStyle }

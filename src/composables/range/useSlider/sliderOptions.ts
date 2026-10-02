/** Утилиты: параметры слайдера — значения по умолчанию, слайды на экране и на шаг, границы индекса */
import type { ResolvedSliderOptions, UseSliderOptions } from './types/useSlider.types'

/** Описание: параметры поведения со значениями по умолчанию */
function resolveBehavior({
	animation = () => 'slide',
	isAutoplay = () => false,
	autoplayInterval = () => 4000,
	isLoop = () => true,
	initialIndex = () => 0,
}: UseSliderOptions) {
	return { animation, isAutoplay, autoplayInterval, isLoop, initialIndex }
}

/** Описание: параметры раскладки со значениями по умолчанию */
function resolveLayout({
	isVertical = () => false,
	snapThreshold = 20,
	spaceBetween = () => 0,
	slidesPerView = () => 1,
	slidesPerGroup = () => 1,
}: UseSliderOptions) {
	return { isVertical, snapThreshold, spaceBetween, slidesPerView, slidesPerGroup }
}

/** Описание: параметры useSlider, где у каждого необязательного геттера есть значение по умолчанию */
function resolveSliderOptions(options: UseSliderOptions): ResolvedSliderOptions {
	return { ...options, ...resolveBehavior(options), ...resolveLayout(options) }
}

/** Описание: количество видимых слайдов (минимум 1) */
function perView(settings: ResolvedSliderOptions): number {
	return Math.max(1, settings.slidesPerView())
}

/** Описание: количество слайдов для перелистывания за шаг (минимум 1) */
function perGroup(settings: ResolvedSliderOptions): number {
	return Math.max(1, settings.slidesPerGroup())
}

/** Описание: максимальный индекс с учётом slidesPerView */
function maxSlideIndex(settings: ResolvedSliderOptions): number {
	return Math.max(0, settings.itemCount() - perView(settings))
}

/** Описание: целый индекс в границах 0…maxSlideIndex; NaN и бесконечность — 0 */
function clampSlideIndex(settings: ResolvedSliderOptions, index: number): number {
	if (!Number.isFinite(index)) return 0
	return Math.max(0, Math.min(Math.trunc(index), maxSlideIndex(settings)))
}

export { clampSlideIndex, maxSlideIndex, perGroup, perView, resolveSliderOptions }

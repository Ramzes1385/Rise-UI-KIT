import type { PropsWithDefaults } from '@composables/base/useDefaults'
/**
 * Элемент слайдера
 */
export interface SliderItem {
	/** URL изображения или видео */
	src: string
	/** Тип медиа */
	type?: 'image' | 'video'
	/** Постер для видео */
	poster?: string
	/** Альтернативный текст */
	alt?: string
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
}

/**
 * Анимации переключения: `slide` — лента; `fade` — растворение; `scale` — растворение с приближением; `flip` — поворот;
 * `cube` — грани куба; `coverflow` — соседние слайды видны по бокам под углом.
 */
export const SLIDER_ANIMATIONS = ['slide', 'fade', 'scale', 'flip', 'cube', 'coverflow'] as const

export type SliderAnimation = (typeof SLIDER_ANIMATIONS)[number]

/** Анимации, где слайды расставлены в пространстве относительно текущего: им нужно смещение каждого слайда. */
export const SLIDER_SPATIAL_ANIMATIONS: readonly SliderAnimation[] = ['cube', 'coverflow']

/** Дальше этого смещения слайды складываются в одну точку и скрыты. */
export const SLIDER_EFFECT_RANGE = 3

export type SliderNavigation = 'dots' | 'thumbnails' | 'both' | 'none'

import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export interface BaseSliderProps extends BaseComponentProps<
	string,
	| 'root'
	| 'arrows'
	| 'arrow'
	| 'viewport'
	| 'track'
	| 'slide'
	| 'caption'
	| 'title'
	| 'desc'
	| 'navigation'
	| 'dots'
	| 'dot'
	| 'thumbs'
	| 'thumb'
> {
	/** Элементы слайдера */
	items: SliderItem[]
	/**
	 * Анимация переключения, как эффекты Swiper: `slide`, `fade`, `scale`, `flip`, `cube`, `coverflow`.
	 * Кроме `slide`, видимым считается один текущий слайд (`slidesPerView` не действует). При `prefers-reduced-motion` смена мгновенная.
	 */
	animation?: SliderAnimation
	/** Тип навигации */
	navigation?: SliderNavigation
	/** Автоматическое воспроизведение */
	isAutoplay?: boolean
	/** Интервал автопроигрывания (мс) */
	autoplayInterval?: number
	/** Показывать стрелки */
	hasArrows?: boolean
	/** Позиция стрелок */
	arrowsPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
	/** Бесконечная прокрутка */
	isLoop?: boolean
	/** Вертикальный режим */
	isVertical?: boolean
	/** Начальный слайд */
	initialIndex?: number
	/** Высота слайдера */
	height?: string
	/** Отступ между слайдами (px) */
	spaceBetween?: number
	/** Количество видимых слайдов */
	slidesPerView?: number
	/** Количество слайдов для перелистывания за один шаг */
	slidesPerGroup?: number
	/** Показывать подписи слайдов */
	hasCaption?: boolean
	/** Включить зум картинок по клику */
	isZoomable?: boolean
}

export interface BaseSliderEmits {
	(event: 'change', index: number): void
	(event: 'next'): void
	(event: 'prev'): void
}

export interface BaseSliderSlots {
	default?: (props: { item: SliderItem; index: number }) => unknown
	caption?: (props: { item: SliderItem; index: number }) => unknown
	header?: () => unknown
	footer?: () => unknown
}

export type SliderProps = PropsWithDefaults<
	BaseSliderProps,
	| 'animation'
	| 'isAutoplay'
	| 'autoplayInterval'
	| 'isLoop'
	| 'isVertical'
	| 'initialIndex'
	| 'spaceBetween'
	| 'slidesPerView'
	| 'slidesPerGroup'
	| 'sizeScale'
>

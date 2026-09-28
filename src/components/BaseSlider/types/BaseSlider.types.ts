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

export type SliderAnimation = 'slide' | 'fade' | 'scale' | 'flip'

export type SliderNavigation = 'dots' | 'thumbnails' | 'both' | 'none'

import type { BaseComponentProps } from '@composables/useBaseComponent'

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
	/** Анимация переключения */
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

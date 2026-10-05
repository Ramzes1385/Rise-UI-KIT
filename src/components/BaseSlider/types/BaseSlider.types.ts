import type { UiProp } from '@composables/base/useUi'
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
 * `cube` — грани куба; `coverflow` — соседние слайды видны по бокам под углом; `cards` — колода карточек;
 * `creative` — новый слайд наезжает поверх, прежний уходит вглубь.
 */
export const SLIDER_ANIMATIONS = ['slide', 'fade', 'scale', 'flip', 'cube', 'coverflow', 'cards', 'creative'] as const

export type SliderAnimation = (typeof SLIDER_ANIMATIONS)[number]

/** Анимации, где слайды расставлены в пространстве относительно текущего: им нужно смещение каждого слайда. */
export const SLIDER_SPATIAL_ANIMATIONS: readonly SliderAnimation[] = ['flip', 'cube', 'coverflow', 'cards', 'creative']

/** Дальше этого смещения слайды складываются в одну точку и скрыты. */
export const SLIDER_EFFECT_RANGE = 3

export type SliderNavigation = 'dots' | 'thumbnails' | 'both' | 'none'

/** Места ленты миниатюр: `bottom` — под слайдами, `left` и `right` — вертикальная лента сбоку */
export const SLIDER_THUMBNAILS_POSITIONS = ['bottom', 'left', 'right'] as const

export type SliderThumbnailsPosition = (typeof SLIDER_THUMBNAILS_POSITIONS)[number]

/**
 * Части слайдера для пропа `ui` (БЭМ-элементы `.base-slider__<часть>`, `root` — корень-область карусели):
 * body — слайды и навигация; stage — область слайдов со стрелками; rotation — кнопка автопрокрутки; arrows — блок стрелок;
 * arrow — стрелка «назад» или «вперёд»; viewport — окно ленты; track — лента слайдов; slide — слайд;
 * video — видео слайда; image — картинка слайда; caption — подпись поверх слайда; title — заголовок подписи; desc — описание;
 * navigation — точки и миниатюры; dots — ряд точек; dot — точка (у текущей страницы — вытянутая);
 * thumbs — лента миниатюр; thumb — миниатюра; thumb-image — картинка миниатюры; thumb-play — значок видео на миниатюре.
 */
export const SLIDER_PARTS = [
	'body',
	'stage',
	'rotation',
	'arrows',
	'arrow',
	'viewport',
	'track',
	'slide',
	'video',
	'image',
	'caption',
	'title',
	'desc',
	'navigation',
	'dots',
	'dot',
	'thumbs',
	'thumb',
	'thumb-image',
	'thumb-play',
] as const

export type BaseSliderPart = (typeof SLIDER_PARTS)[number]

import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export interface BaseSliderProps extends Omit<
	BaseComponentProps<
		string,
		| 'root'
		| 'arrows'
		| 'arrow'
		| 'rotation'
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
	>,
	'variant' | 'color'
> {
	/** Элементы слайдера */
	items: SliderItem[]
	/**
	 * Анимация переключения, как эффекты Swiper: `slide`, `fade`, `scale`, `flip`, `cube`, `coverflow`, `cards`, `creative`.
	 * Кроме `slide`, видимым считается один текущий слайд (`slidesPerView` не действует). При `prefers-reduced-motion` смена мгновенная.
	 */
	animation?: SliderAnimation
	/** Тип навигации */
	navigation?: SliderNavigation
	/**
	 * Автопрокрутка (APG Carousel): первой в порядке Tab появляется кнопка «Остановить/Запустить автопрокрутку».
	 * Пауза под указателем; фокус на слайде или стрелке, запуск видео и `prefers-reduced-motion` останавливают прокрутку до кнопки
	 */
	isAutoplay?: boolean
	/** Интервал автопроигрывания (мс) */
	autoplayInterval?: number
	/**
	 * Где лента миниатюр (`navigation`: `thumbnails` или `both`): `bottom` — под слайдами; `left` и `right` — вертикальная лента
	 * сбоку с прокруткой, миниатюры листаются клавишами ↑/↓. Уже 480px (container query по ширине слайдера) лента возвращается вниз.
	 * Корень с боковой лентой — контейнер по ширине (`container-type: inline-size`): ширину ему задаёт родитель.
	 */
	thumbnailsPosition?: SliderThumbnailsPosition
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
	/** Имя карусели для скринридера (`aria-label` области); по умолчанию «Карусель» из словаря */
	label?: string
	/**
	 * Классы частей слайдера (`root`, `viewport`, `slide`, `caption`, `dot`, `thumb`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSlider: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSlider :items="items" :ui="{ viewport: 'rounded-none', caption: 'text-left' }" />
	 */
	ui?: UiProp<BaseSliderPart>
}

/** Методы экземпляра BaseSlider (`ref`) */
export interface BaseSliderExpose {
	/** Перейти к слайду; номер за краем — к краю */
	goTo: (index: number) => void
	/** Следующий слайд */
	goNext: () => void
	/** Предыдущий слайд */
	goPrev: () => void
	/** Остановить автопрокрутку (как кнопка «Остановить») */
	stopAutoplay: () => void
	/** Запустить автопрокрутку снова */
	playAutoplay: () => void
}

export interface BaseSliderEmits {
	(event: 'change', index: number): void
	(event: 'next'): void
	(event: 'prev'): void
}

export interface BaseSliderSlots {
	/** Содержимое слайда вместо картинки или видео: `item` — слайд из `items`, `index` — его номер */
	default?: (props: { item: SliderItem; index: number }) => unknown
	/** Подпись слайда вместо `title` и `description`; показывается, если у слайда они есть */
	caption?: (props: { item: SliderItem; index: number }) => unknown
	/** Над слайдами */
	header?: () => unknown
	/** Под слайдами и навигацией */
	footer?: () => unknown
}

export type SliderProps = PropsWithDefaults<
	BaseSliderProps,
	| 'animation'
	| 'isAutoplay'
	| 'autoplayInterval'
	| 'isLoop'
	| 'isVertical'
	| 'thumbnailsPosition'
	| 'initialIndex'
	| 'spaceBetween'
	| 'slidesPerView'
	| 'slidesPerGroup'
	| 'sizeScale'
>

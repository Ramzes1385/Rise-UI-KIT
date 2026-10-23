import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты: default — без фона и рамки, soft — мягкий фон, outline — рамка */
export const MARQUEE_VARIANTS = ['default', 'soft', 'outline'] as const

/** Куда движется лента: `left` и `right` — по горизонтали, `up` и `down` — по вертикали */
export const MARQUEE_DIRECTIONS = ['left', 'right', 'up', 'down'] as const

/**
 * Части ленты для пропа `ui` (БЭМ-элементы `.base-marquee__<часть>`, `root` — корень с `role="marquee"`):
 * viewport — видимая область, track — движущаяся дорожка, group — повтор содержимого, item — элемент из `items`,
 * separator — разделитель после элемента, button — кнопка паузы.
 */
export const MARQUEE_PARTS = ['viewport', 'track', 'group', 'item', 'separator', 'button'] as const

export type BaseMarqueePart = (typeof MARQUEE_PARTS)[number]

/** Направление движения ленты */
export type MarqueeDirection = (typeof MARQUEE_DIRECTIONS)[number]

/**
 * Пропсы компонента BaseMarquee
 */
export interface BaseMarqueeProps<T = unknown> extends BaseComponentProps<
	(typeof MARQUEE_VARIANTS)[number],
	'root' | 'viewport' | 'item' | 'button'
> {
	/** Элементы ленты; вид элемента — слот `item`, после каждого — слот `separator`. Без `items` лента показывает слот default */
	items?: readonly T[]
	/** Куда движется лента: `left` (по умолчанию), `right`, `up`, `down` */
	direction?: MarqueeDirection
	/** Скорость в пикселях в секунду; длительность круга считается по размеру содержимого */
	speed?: number
	/** Расстояние между элементами и между повторами ленты, px (масштабируется `sizeScale`) */
	gap?: number
	/** Затухание краёв ленты */
	hasFade?: boolean
	/** Кнопка паузы (по умолчанию есть): движение дольше 5 секунд должно останавливаться (WCAG 2.2.2) */
	hasPauseButton?: boolean
	/** Лента остановлена (v-model:is-paused); наведение и фокус внутри останавливают её, не меняя значения */
	isPaused?: boolean
	/** Имя ленты для скринридера; по умолчанию «Бегущая строка» */
	label?: string
	/**
	 * Классы частей ленты (`root`, `viewport`, `track`, `group`, `item`, `separator`, `button`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseMarquee: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseMarquee :items="news" :ui="{ root: 'promo-strip', item: 'font-semibold' }" />
	 */
	ui?: UiProp<BaseMarqueePart>
}

export interface BaseMarqueeEmits {
	/** Лента остановлена или запущена кнопкой паузы */
	(event: 'update:isPaused', value: boolean): void
}

/**
 * Слоты компонента BaseMarquee
 */
export interface BaseMarqueeSlots<T = unknown> {
	/** Содержимое ленты, когда `items` не переданы */
	default?: () => unknown
	/** Вид элемента из `items`; по умолчанию — сам элемент текстом */
	item?: (props: { item: T; index: number }) => unknown
	/** Разделитель после каждого элемента из `items` — например точка или значок */
	separator?: () => unknown
}

/** Пропсы BaseMarquee после значений по умолчанию */
export type MarqueeProps = PropsWithDefaults<BaseMarqueeProps, 'direction' | 'speed' | 'gap' | 'hasFade' | 'hasPauseButton' | 'isPaused'>

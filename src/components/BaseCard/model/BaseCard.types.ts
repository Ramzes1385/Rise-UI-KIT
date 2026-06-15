import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'
import type { PaddingProp } from '@composables/usePadding'

/** Варианты отображения карточки */
export const CARD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseCard
 */
export interface BaseCardProps {
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `header`, `title`, `subtitle`, `actions`, `body`, `footer`.
	 */
	customClass?: CustomClassProp
	/** Заголовок */
	title?: string
	/** Подзаголовок */
	subtitle?: string
	/** Интерактивная карточка */
	isHoverable?: boolean
	/** Вариант отображения */
	variant?: (typeof CARD_VARIANTS)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию 24 → 24px 48px
	 */
	padding?: PaddingProp
	/** Высота карточки (px, %, auto и т.д.) */
	height?: string
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Включить прокрутку тела карточки */
	scroll?: boolean
}

/**
 * Привязки слотов компонента BaseCard
 */
export interface BaseCardSlotBindings {
	/** Масштаб размера */
	sizeScale: number
}

/**
 * Слоты компонента BaseCard
 */
export interface BaseCardSlots {
	default?: (props: BaseCardSlotBindings) => unknown
	header?: (props: BaseCardSlotBindings) => unknown
	footer?: (props: BaseCardSlotBindings) => unknown
	/** Действия в заголовке */
	actions?: (props: BaseCardSlotBindings) => unknown
}

import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { PaddingProp } from '@composables/base/usePadding'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения панели:
 * default — рамка и тень; outline — рамка заметнее, без тени; shadow — только тень, крупнее;
 * soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое).
 */
export const DROPDOWN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Части для пропа `ui`: root — обёртка с триггером, panel — панель (телепортирована в body), arrow — стрелка панели */
export const DROPDOWN_PARTS = ['root', 'panel', 'arrow'] as const

export type BaseDropdownPart = (typeof DROPDOWN_PARTS)[number]

export type DropdownPosition =
	| 'bottom-start'
	| 'bottom-end'
	| 'bottom'
	| 'top-start'
	| 'top-end'
	| 'top'
	| 'left-start'
	| 'left-end'
	| 'left'
	| 'right-start'
	| 'right-end'
	| 'right'

/**
 * Точка (`width` и `height` не заданы) или прямоугольник в координатах окна, как у `getBoundingClientRect()`
 */
export interface DropdownAnchorRect {
	/** Левый край, px */
	x: number
	/** Верхний край, px */
	y: number
	/** Ширина, px (0 — точка) */
	width?: number
	/** Высота, px (0 — точка) */
	height?: number
}

/** Виртуальный элемент, как в Floating UI: всё, у чего есть `getBoundingClientRect()` (в том числе настоящий элемент) */
export interface DropdownAnchorElement {
	getBoundingClientRect: () => DOMRect
}

/** Якорь панели вместо триггера: точка, прямоугольник или виртуальный элемент; прямоугольник элемента читается при каждом пересчёте */
export type DropdownAnchor = DropdownAnchorRect | DropdownAnchorElement

export interface BaseDropdownProps extends BaseComponentProps<(typeof DROPDOWN_VARIANTS)[number], 'root' | 'panel' | 'arrow'> {
	/** Открыт ли список */
	isOpen?: boolean
	/** Позиция относительно триггера */
	position?: DropdownPosition
	/** Якорь вместо триггера: точка `{ x, y }`, прямоугольник `{ x, y, width, height }` в координатах окна или виртуальный элемент (`getBoundingClientRect`) — меню у курсора, окно у каретки */
	anchor?: DropdownAnchor
	/** Отступ от триггера (px) */
	gap?: number
	/** Максимальная высота */
	maxHeight?: string
	/** Минимальная ширина панели равна ширине триггера */
	matchWidth?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
	/** Предотвращать mousedown внутри панели (сохраняет фокус триггера) */
	preventMousedown?: boolean
	/**
	 * Панель — диалог (APG Dialog: в ней поля и кнопки, содержимое с `role="dialog"`): при открытии фокус переходит в панель,
	 * Tab и Shift+Tab ходят по кругу внутри неё, после закрытия фокус возвращается на триггер.
	 * По умолчанию (`false`) панель — список или меню: Tab, уводящий фокус из панели, закрывает её и возвращает фокус
	 * на триггер; стрелки вверх и вниз, Home и End переводят фокус по пунктам (`menuitem*`, `option`), если фокус на пункте
	 */
	trapFocus?: boolean
	/** CSS-класс панели */
	panelClass?: string
	/**
	 * Стрелка на краю панели, обращённом к триггеру. Показывает, откуда открыта панель и с какой стороны:
	 * после переворота у края окна стрелка переходит на другой край, при сдвиге панели остаётся напротив середины триггера.
	 * Панель со стрелкой не обрезает содержимое по краям (`overflow: visible`) — для длинных прокручиваемых списков стрелка не подходит
	 */
	showArrow?: boolean
	/**
	 * Внутренние отступы панели. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию — из стилей: 4px со всех сторон (пункты меню почти касаются краёв панели, как в меню Nuxt UI).
	 */
	padding?: PaddingProp
	/**
	 * Появление и уход панели: `scale` (по умолчанию) — масштаб от угла у триггера (`--rise-motion-scale-from`),
	 * `fade` — только прозрачность, `slide` — сдвиг от триггера на `--rise-motion-distance` (сторона — фактическая,
	 * после переворота), `pop` — масштаб с пружиной, `none` — сразу. Длительности — токены и пресет `data-rise-motion`
	 * области триггера; при «уменьшить движение» — сразу. Глобально — `defaults.BaseDropdown.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей: добавляются к БЭМ-классам кита (`base-dropdown`, `base-dropdown__panel`, `base-dropdown__arrow`),
	 * глобальные — `defaults.BaseDropdown.ui`.
	 *
	 * @example
	 * <BaseDropdown :ui="{ panel: 'rounded-xl shadow-2xl' }" />
	 */
	ui?: UiProp<BaseDropdownPart>
}

export interface BaseDropdownEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}

export interface BaseDropdownSlots {
	/** Триггер (кнопка или другой элемент) */
	default?: () => unknown
	/** Содержимое выпадающей панели */
	dropdown?: () => unknown
}

export interface BaseDropdownExpose {
	/** Обновить позицию панели вручную */
	updatePosition: () => void
}

export type DropdownProps = PropsWithDefaults<BaseDropdownProps, 'isOpen' | 'position' | 'gap' | 'maxHeight' | 'matchWidth'>

/** Новый индекс пункта по клавише: стрелки по кругу, Home — первый, End — последний */
export type DropdownItemStep = (index: number, count: number) => number

/** Элементы для клавиатуры панели: обёртка с триггером, панель и элемент, с которого открыли панель */
export interface DropdownKeyboardRefs {
	wrapperRef: Ref<HTMLElement | null>
	dropdownRef: Ref<HTMLElement | null>
	savedActiveElement: Ref<HTMLElement | null>
}

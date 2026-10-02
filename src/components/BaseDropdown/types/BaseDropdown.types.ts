import type { Ref } from 'vue'
import type { PaddingProp } from '@composables/base/usePadding'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения панели:
 * default — рамка и тень; outline — рамка заметнее, без тени; shadow — только тень, крупнее;
 * soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое).
 */
export const DROPDOWN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

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

export interface BaseDropdownProps extends BaseComponentProps<(typeof DROPDOWN_VARIANTS)[number], 'root' | 'panel' | 'arrow'> {
	/** Открыт ли список */
	isOpen?: boolean
	/** Позиция относительно триггера */
	position?: DropdownPosition
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

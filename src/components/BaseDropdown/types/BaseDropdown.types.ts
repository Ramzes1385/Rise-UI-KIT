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

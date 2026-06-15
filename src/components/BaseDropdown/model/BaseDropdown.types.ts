import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'
import type { PaddingProp } from '@composables/usePadding'

/** Варианты отображения выпадающего списка */
export const DROPDOWN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Позиция выпадающего списка
 */
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
 * Пропсы компонента BaseDropdown
 */
export interface BaseDropdownProps {
	/** Открыт ли список */
	isOpen?: boolean
	/** Позиция относительно триггера */
	position?: DropdownPosition
	/** Вариант отображения */
	variant?: (typeof DROPDOWN_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
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
	 * Внутренние отступы панели. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 */
	padding?: PaddingProp
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseDropdown
 */
export interface BaseDropdownEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}

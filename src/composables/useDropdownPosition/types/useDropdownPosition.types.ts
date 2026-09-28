import type { Ref } from 'vue'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'

export interface UseDropdownPositionOptions {
	/** Ref на wrapper-элемент (содержит триггер) */
	wrapperRef: Ref<HTMLElement | null>
	/** Ref на dropdown-панель */
	dropdownRef: Ref<HTMLElement | null>
	/** Позиция выпадающего списка */
	position: () => DropdownPosition
	/** Отступ от триггера (px) */
	gap: () => number
	/** Мин. ширина панели равна ширине триггера */
	matchWidth: () => boolean
	/** Максимальная высота панели */
	maxHeight: () => string
	/** Открыт ли dropdown */
	isOpen: () => boolean
}

export type Side = 'top' | 'bottom' | 'left' | 'right'

export type Align = 'start' | 'end' | 'center'

export interface Size {
	width: number
	height: number
}

/** Всё для расчёта позиции: прямоугольник триггера, размер панели, окно и отступ панели от триггера */
export interface Geometry {
	rect: DOMRect
	size: Size
	viewport: Size
	gap: number
}

/** Край триггера вдоль стороны, у которой стоит панель: начало, конец и середина */
export interface Edge {
	start: number
	end: number
	middle: number
}

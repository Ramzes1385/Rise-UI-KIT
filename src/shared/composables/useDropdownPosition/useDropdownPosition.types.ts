import type { Ref } from 'vue'

import type { DropdownPosition } from '@/shared/ui/BaseDropdown/BaseDropdown.types'

/**
 * Опции composable useDropdownPosition
 */
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

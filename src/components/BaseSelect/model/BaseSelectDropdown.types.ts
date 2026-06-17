import type { BaseSelectOption } from './BaseSelect.types'

/** Props компонента BaseSelectDropdown */
export interface BaseSelectDropdownProps {
	/** Отфильтрованные опции */
	filteredOptions: BaseSelectOption[]
	/** Показывать поиск */
	isSearchable: boolean
	/** Мультивыбор */
	isMultiple: boolean
	/** Масштаб размера */
	sizeScale: number
	/** Проверка, выбрана ли опция */
	isSelected: (value: string | number) => boolean
	/** Объект CSS-классов для кастомизации элементов дропдауна */
	classes: Record<string, string | undefined>
	/** CSS-стили масштабирования */
	sizeScaleStyle: Record<string, string> | undefined
}

/** Emits компонента BaseSelectDropdown */
export interface BaseSelectDropdownEmits {
	(event: 'select', option: BaseSelectOption): void
}

/** Слоты компонента BaseSelectDropdown */
export interface BaseSelectDropdownSlots {
	header?: () => unknown
	option?: (props: { option: BaseSelectOption; isSelected: boolean }) => unknown
	empty?: () => unknown
	footer?: () => unknown
}

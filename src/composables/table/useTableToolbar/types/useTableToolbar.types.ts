import type { ComputedRef, Ref, useSlots } from 'vue'
import type { FilterOption, TableColumn } from '@components/BaseTable/types/BaseTable.types'
import type { FilterDraft, FilterKind } from '@composables/table/useTableFilter/types/useTableFilter.types'

export interface UseTableToolbarOptions {
	filterableColumns: () => TableColumn[]
	hasSearch: () => boolean
	hasFilters: () => boolean
	hasColumnSettings: () => boolean
	slots: ReturnType<typeof useSlots>
	addFilter: (draft: FilterDraft) => void
	removeFilter: (index: number) => void
}

export interface FilterOperatorOption {
	value: string
	label: string
}

export interface UseTableToolbarReturn {
	filterColumn: Ref<string | number>
	filterOperator: Ref<string | number>
	filterValue: Ref<string>
	/** Верхняя граница оператора `between` */
	filterValueTo: Ref<string>
	/** Выбранные значения оператора `in` */
	filterValues: Ref<string[]>
	isSettingsOpen: Ref<boolean>
	filterColumnOptions: ComputedRef<Array<{ value: string; label: string }>>
	filterOperatorOptions: ComputedRef<FilterOperatorOption[]>
	/** Тип поля значения выбранной колонки */
	filterKind: ComputedRef<FilterKind>
	/** Варианты выбора колонок `select` и `multi-select` */
	filterSelectOptions: ComputedRef<FilterOption[]>
	/** Подсказка поля значения из `filterConfig.placeholder` */
	filterPlaceholder: ComputedRef<string | undefined>
	/** Выбран оператор `between`: два поля значения */
	isRangeOperator: ComputedRef<boolean>
	/** Введено достаточно для добавления фильтра */
	canAddFilter: ComputedRef<boolean>
	showToolbar: ComputedRef<boolean>
	getSelectValue: (value: string | number | (string | number)[]) => string | number
	setFilterColumn: (value: string | number | (string | number)[]) => void
	setFilterOperator: (value: string | number | (string | number)[]) => void
	handleAddFilter: () => void
	handleRemoveFilter: (index: number) => void
}

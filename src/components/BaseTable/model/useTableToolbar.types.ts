import type { ComputedRef, Ref } from 'vue'
import type { useSlots } from 'vue'

import type { TableColumn } from './BaseTable.types'

export interface UseTableToolbarOptions {
	filterableColumns: () => TableColumn[]
	hasSearch: () => boolean
	hasFilters: () => boolean
	hasColumnSettings: () => boolean
	slots: ReturnType<typeof useSlots>
	addFilter: (column: Ref<string | number>, operator: Ref<string | number>, value: Ref<string>) => void
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
	isSettingsOpen: Ref<boolean>
	filterColumnOptions: ComputedRef<Array<{ value: string; label: string }>>
	filterOperatorOptions: FilterOperatorOption[]
	showToolbar: ComputedRef<boolean>
	getSelectValue: (value: string | number | (string | number)[]) => string | number
	setFilterColumn: (value: string | number | (string | number)[]) => void
	setFilterOperator: (value: string | number | (string | number)[]) => void
	handleAddFilter: () => void
	handleRemoveFilter: (index: number) => void
}

import type { BaseTableEmits, TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { ComputedRef, Slots } from 'vue'

export interface UseTableCompositionOptions {
	rows: ComputedRef<TableRow[]>
	columns: ComputedRef<TableColumn[]>
	loadMode: ComputedRef<string>
	pageSize: ComputedRef<number>
	isMultiSort: ComputedRef<boolean>
	searchDebounce: ComputedRef<number>
	isResizable: ComputedRef<boolean>
	hasRowNumber: ComputedRef<boolean>
	isSelectable: ComputedRef<boolean>
	hasSearch: ComputedRef<boolean>
	hasFilters: ComputedRef<boolean>
	hasColumnSettings: ComputedRef<boolean>
	isLoading: ComputedRef<boolean>
	pageSizeOptions: ComputedRef<number[]>
	infiniteScrollThreshold: number
	emit: BaseTableEmits
	slots: Slots
}

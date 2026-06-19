import type { BaseTableEmits, TableColumn, TableRow } from '../model/BaseTable.types'
import type { Slots } from 'vue'

export interface UseTableCompositionOptions {
	rows: { value: readonly TableRow[] }
	columns: { value: readonly TableColumn[] }
	loadMode: { value: string }
	pageSize: { value: number }
	isMultiSort: { value: boolean }
	searchDebounce: { value: number }
	isResizable: { value: boolean }
	hasRowNumber: { value: boolean }
	isSelectable: { value: boolean }
	hasSearch: { value: boolean }
	hasFilters: { value: boolean }
	hasColumnSettings: { value: boolean }
	isLoading: { value: boolean }
	pageSizeOptions: { value: readonly number[] }
	infiniteScrollThreshold: number
	emit: BaseTableEmits
	slots: Slots
}

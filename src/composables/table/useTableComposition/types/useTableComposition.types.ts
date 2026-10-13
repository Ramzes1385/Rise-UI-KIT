import type { ComputedRef } from 'vue'
import type { BaseTableEmits, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableCompositionOptions {
	rows: ComputedRef<TableRow[]>
	columns: ComputedRef<TableColumn[]>
	loadMode: ComputedRef<string>
	pageSize: ComputedRef<number>
	hasMore?: ComputedRef<boolean>
	isMultiSort: ComputedRef<boolean>
	searchDebounce: ComputedRef<number>
	expandedIds?: ComputedRef<Array<string | number> | undefined>
	sortLocale?: ComputedRef<string | undefined>
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
}

import type { Ref } from 'vue'
import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableProcessedRowsOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Поисковый запрос */
	searchQuery: Ref<string>
	/** Активные фильтры */
	activeFilters: Ref<ColumnFilter[]>
	/** Состояния сортировки */
	sortStates: Ref<SortState[]>
}

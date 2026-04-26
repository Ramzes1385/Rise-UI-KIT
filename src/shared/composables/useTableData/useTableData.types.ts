import type { Ref } from 'vue'

import type { ColumnFilter, SortState, TableColumn, TableRow } from '@/shared/ui/BaseTable/BaseTable.types'

/**
 * Опции composable useTableData
 */
export interface UseTableDataOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Размер страницы */
	pageSize: Ref<number>
	/** Множественная сортировка */
	isMultiSort: () => boolean
	/** Дебаунс поиска (мс) */
	searchDebounce: () => number
	/** Callback при поиске */
	onSearch?: (query: string) => void
	/** Callback при сортировке */
	onSort?: (states: SortState[]) => void
	/** Callback при фильтрации */
	onFilter?: (filters: ColumnFilter[]) => void
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
}

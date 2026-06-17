import type { ColumnFilter, TableColumn } from '@components/BaseTable/model/BaseTable.types'
import type { Ref } from 'vue'

/**
 * Опции composable useTableFilter
 */
export interface UseTableFilterOptions {
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Callback при изменении фильтров */
	onFilter?: (filters: ColumnFilter[]) => void
}

/**
 * Результат composable useTableFilter
 */
export interface UseTableFilterReturn {
	/** Активные фильтры */
	activeFilters: Ref<ColumnFilter[]>
	/** Добавить фильтр */
	addFilter: (
		filterColumn: Ref<string | number>,
		filterOperator: Ref<string | number>,
		filterValue: Ref<string>,
	) => void
	/** Удалить фильтр */
	removeFilter: (index: number) => void
	/** Получить текстовую метку фильтра */
	getFilterLabel: (filter: ColumnFilter) => string
}

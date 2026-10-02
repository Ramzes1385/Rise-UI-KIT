/** Composable: сортировка, фильтрация, пагинация и поиск таблицы */
import { useTableSort } from '@composables/table/useTableSort'
import { useTableProcessedRows } from './useTableProcessedRows'
import { createTableDataActions } from './createTableDataActions'
import { useTableFilter } from '@composables/table/useTableFilter'
import { useTableSearch } from '@composables/table/useTableSearch'
import { useTablePagination } from '@composables/table/useTablePagination'
import type { UseTableDataOptions, UseTableDataReturn } from './types/useTableData.types'

/**
 * Composable для сортировки, фильтрации, пагинации и поиска таблицы.
 * Является фасадом над специализированными composables:
 * useTableSearch, useTableFilter, useTableSort, useTablePagination, useTableSelection.
 *
 * @example
 * ```ts
 * const {
 *   searchQuery, sortStates, activeFilters,
 *   processedRows, displayedRows, currentPage, totalPages, visiblePages,
 *   getSortDirection, handleSort, handleSearchInput, addFilter, removeFilter,
 * } = useTableData({
 *   rows: computed(() => props.rows),
 *   columns: localColumns,
 *   loadMode: () => props.loadMode,
 *   pageSize: computed(() => props.pageSize),
 *   isMultiSort: () => props.isMultiSort,
 *   searchDebounce: () => props.searchDebounce,
 *   onSearch: (q) => emit('search', q),
 *   onSort: (s) => emit('sort', s),
 *   onFilter: (f) => emit('filter', f),
 * })
 * ```
 */
function useTableData(options: UseTableDataOptions): UseTableDataReturn {
	const { rows, columns, loadMode, pageSize, hasMore, isMultiSort, searchDebounce, onSearch, onSort, onFilter, onPageSizeChange } =
		options

	const { searchQuery, handleSearchInput } = useTableSearch({ searchDebounce, onSearch })

	const {
		activeFilters,
		addFilter: baseAddFilter,
		removeFilter: baseRemoveFilter,
		getFilterLabel,
	} = useTableFilter({ columns, onFilter })

	const { sortStates, getSortDirection, getSortIndex, handleSort } = useTableSort({ isMultiSort, onSort })

	/** Обработанные строки (поиск + фильтры + сортировка) */
	const processedRows = useTableProcessedRows({ rows, columns, searchQuery, activeFilters, sortStates })

	const { currentPage, localPageSize, displayedRows, totalPages, visiblePages, hasMoreRows, loadMore, resetPage, handlePageSizeChange } =
		useTablePagination({ processedRows, loadMode, pageSize, hasMore, onPageSizeChange })

	const { addFilter, removeFilter, handleSearchInputWithReset } = createTableDataActions({
		baseAddFilter,
		baseRemoveFilter,
		handleSearchInput,
		resetPage,
	})

	return {
		searchQuery,
		sortStates,
		activeFilters,
		currentPage,
		localPageSize,
		processedRows,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
		getSortDirection,
		getSortIndex,
		handleSort,
		handleSearchInput: handleSearchInputWithReset,
		addFilter,
		removeFilter,
		getFilterLabel,
		handlePageSizeChange,
		loadMore,
		resetPage,
	}
}

export { useTableData }

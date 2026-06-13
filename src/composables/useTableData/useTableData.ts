import { computed, watch } from 'vue'
import type { Ref } from 'vue'

import type { TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'
import { useTableFilter } from '@composables/useTableFilter'
import { useTablePagination } from '@composables/useTablePagination'
import { useTableSearch } from '@composables/useTableSearch'
import { useTableSort } from '@composables/useTableSort'

import type { UseTableDataOptions, UseTableDataReturn } from './useTableData.types'

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
	const {
		rows,
		columns,
		loadMode,
		pageSize,
		isMultiSort,
		searchDebounce,
		onSearch,
		onSort,
		onFilter,
		onPageSizeChange,
	} = options

	const { searchQuery, handleSearchInput } = useTableSearch({ searchDebounce, onSearch })

	const { activeFilters, addFilter: baseAddFilter, removeFilter: baseRemoveFilter, getFilterLabel } = useTableFilter({
		columns,
		onFilter,
	})

	const { sortStates, getSortDirection, getSortIndex, handleSort } = useTableSort({
		isMultiSort,
		onSort,
	})

	// ============================================================
	// Обработка данных: поиск + фильтры + сортировка
	// ============================================================

	/** Обработанные строки (поиск + фильтры + сортировка) */
	const processedRows = computed((): TableRow[] => {
		let result = [...rows.value]

		// Поиск
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase()
			result = result.filter(row => {
				return Object.values(row.data).some(val => String(val).toLowerCase().includes(query))
			})
		}

		// Фильтры
		for (const filter of activeFilters.value) {
			result = result.filter(row => {
				const val = row.data[filter.key]
				if (val === undefined) return false
				const strVal = String(val).toLowerCase()
				const filterVal = filter.value.toLowerCase()

				switch (filter.operator) {
					case 'eq':
						return strVal === filterVal
					case 'ne':
						return strVal !== filterVal
					case 'contains':
						return strVal.includes(filterVal)
					case 'gt':
						return Number(val) > Number(filter.value)
					case 'lt':
						return Number(val) < Number(filter.value)
					case 'gte':
						return Number(val) >= Number(filter.value)
					case 'lte':
						return Number(val) <= Number(filter.value)
					default:
						return true
				}
			})
		}

		// Множественная сортировка
		if (sortStates.value.length > 0) {
			result.sort((a, b) => {
				for (const sort of sortStates.value) {
					if (!sort.direction) continue

					const col = columns.value.find((c: TableColumn) => c.key === sort.key)
					const dir = sort.direction === 'asc' ? 1 : -1
					const aVal = a.data[sort.key]
					const bVal = b.data[sort.key]

					const cmp = col?.sortType === 'number'
						? Number(aVal) - Number(bVal)
						: col?.sortType === 'date'
							? new Date(String(aVal)).getTime() - new Date(String(bVal)).getTime()
							: String(aVal).localeCompare(String(bVal))

					if (cmp !== 0) return cmp * dir
				}
				return 0
			})
		}

		return result
	})

	const {
		currentPage,
		localPageSize,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
		loadMore,
		resetPage,
		handlePageSizeChange,
	} = useTablePagination({
		processedRows,
		loadMode,
		pageSize,
		onPageSizeChange,
	})

	function addFilter(
		filterColumn: Ref<string | number>,
		filterOperator: Ref<string | number>,
		filterValue: Ref<string>,
	): void {
		baseAddFilter(filterColumn, filterOperator, filterValue)
		resetPage()
	}

	function removeFilter(index: number): void {
		baseRemoveFilter(index)
		resetPage()
	}

	// Сброс страницы при поиске требует resetPage из pagination
	function handleSearchInputWithReset(value: string): void {
		handleSearchInput(value, resetPage)
	}

	/** Сброс страницы при изменении данных */
	watch(
		() => rows.value,
		() => {
			resetPage()
		},
	)

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

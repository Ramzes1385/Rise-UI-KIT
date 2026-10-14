/** Composable: управление пагинацией таблицы */
import { computed, ref, watch } from 'vue'
import { useTablePageState } from './useTablePageState'
import { useTablePageTotals } from './useTablePageTotals'
import { useTableDisplayedRows } from './useTableDisplayedRows'
import { createTablePaginationActions, DEFAULT_PAGE_SIZE } from './createTablePaginationActions'
import type { UseTablePaginationOptions, UseTablePaginationReturn } from './types/useTablePagination.types'

function useTablePagination(options: UseTablePaginationOptions): UseTablePaginationReturn {
	const { processedRows, loadMode, pageSize, hasMore = () => false, onPageSizeChange, page, onPageChange, totalRows } = options

	const currentPage = useTablePageState(page, onPageChange)
	const localPageSize = ref(pageSize.value)

	const effectivePageSize = computed((): number => {
		return localPageSize.value || DEFAULT_PAGE_SIZE
	})

	/** Количество загруженных строк для button/infinite режимов */
	const loadedCount = ref(effectivePageSize.value)

	const rowsState = { processedRows, loadMode, currentPage, localPageSize, loadedCount, hasMore, totalRows }
	const { displayedRows, hasMoreRows } = useTableDisplayedRows(rowsState)

	const { totalCount, totalPages, visiblePages } = useTablePageTotals({ processedRows, localPageSize, currentPage, totalRows })

	const { loadMore, handlePageSizeChange, resetPage } = createTablePaginationActions({
		loadMode,
		currentPage,
		localPageSize,
		effectivePageSize,
		loadedCount,
		onPageSizeChange,
	})

	watch(totalPages, total => {
		const isAwaitingData = page?.() !== undefined && totalCount.value === 0
		if (!isAwaitingData && currentPage.value > total) currentPage.value = Math.max(total, 1)
	})

	watch(pageSize, newSize => {
		localPageSize.value = newSize
		if (page?.() === undefined) currentPage.value = 1
		loadedCount.value = effectivePageSize.value
	})

	return {
		currentPage,
		localPageSize,
		displayedRows,
		totalCount,
		totalPages,
		visiblePages,
		hasMoreRows,
		loadMore,
		resetPage,
		handlePageSizeChange,
	}
}

export { useTablePagination }

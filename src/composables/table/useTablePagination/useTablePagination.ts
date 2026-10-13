/** Composable: управление пагинацией таблицы */
import { computed, ref, watch } from 'vue'
import { useTableDisplayedRows } from './useTableDisplayedRows'
import { calcTotalPages, calcVisiblePages } from '@utils/navigation/paginationUtils'
import { createTablePaginationActions, DEFAULT_PAGE_SIZE } from './createTablePaginationActions'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'
import type { UseTablePaginationOptions, UseTablePaginationReturn } from './types/useTablePagination.types'

function useTablePagination(options: UseTablePaginationOptions): UseTablePaginationReturn {
	const { processedRows, loadMode, pageSize, hasMore = () => false, onPageSizeChange, page, onPageChange, totalRows } = options

	const internalPage = ref(1)
	const currentPage = computed({
		get: (): number => Math.max(1, page?.() ?? internalPage.value),
		set: (value: number): void => {
			if (value === currentPage.value) return
			if (page?.() === undefined) internalPage.value = value
			onPageChange?.(value)
		},
	})
	const localPageSize = ref(pageSize.value)

	const effectivePageSize = computed((): number => {
		return localPageSize.value || DEFAULT_PAGE_SIZE
	})

	/** Количество загруженных строк для button/infinite режимов */
	const loadedCount = ref(effectivePageSize.value)

	const { displayedRows, hasMoreRows } = useTableDisplayedRows({
		processedRows,
		loadMode,
		currentPage,
		localPageSize,
		loadedCount,
		hasMore,
		totalRows,
	})

	const totalCount = computed((): number => totalRows?.() ?? processedRows.value.length)

	const totalPages = computed((): number => {
		return calcTotalPages(totalCount.value, localPageSize.value)
	})

	const visiblePages = computed((): VisiblePageItem[] => {
		return calcVisiblePages({ current: currentPage.value, total: totalPages.value })
	})

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
		currentPage.value = 1
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

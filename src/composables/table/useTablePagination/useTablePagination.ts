/** Composable: управление пагинацией таблицы */
import { computed, ref, watch } from 'vue'
import { useTableDisplayedRows } from './useTableDisplayedRows'
import { calcTotalPages, calcVisiblePages } from '@utils/navigation/paginationUtils'
import { createTablePaginationActions, DEFAULT_PAGE_SIZE } from './createTablePaginationActions'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'
import type { UseTablePaginationOptions, UseTablePaginationReturn } from './types/useTablePagination.types'

function useTablePagination(options: UseTablePaginationOptions): UseTablePaginationReturn {
	const { processedRows, loadMode, pageSize, onPageSizeChange } = options

	const currentPage = ref(1)
	const localPageSize = ref(pageSize.value)

	const effectivePageSize = computed((): number => {
		return localPageSize.value || DEFAULT_PAGE_SIZE
	})

	/** Количество загруженных строк для button/infinite режимов */
	const loadedCount = ref(effectivePageSize.value)

	/** Сброс счётчика при изменении исходных данных */
	watch(
		() => processedRows.value.length,
		() => {
			loadedCount.value = effectivePageSize.value
		},
	)

	const { displayedRows, hasMoreRows } = useTableDisplayedRows({ processedRows, loadMode, currentPage, localPageSize, loadedCount })

	const totalPages = computed((): number => {
		return calcTotalPages(processedRows.value.length, localPageSize.value)
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

	watch(pageSize, newSize => {
		localPageSize.value = newSize
	})

	return {
		currentPage,
		localPageSize,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
		loadMore,
		resetPage,
		handlePageSizeChange,
	}
}

export { useTablePagination }

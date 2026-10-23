/** Composable: действия пагинации таблицы — подгрузка, смена размера страницы и сброс */
import type { TablePaginationActionsState } from './types/createTablePaginationActions.types'

const DEFAULT_PAGE_SIZE = 5

function createTablePaginationActions(state: TablePaginationActionsState) {
	const { loadMode, currentPage, localPageSize, effectivePageSize, loadedCount, onPageSizeChange } = state

	function loadMore(): void {
		loadedCount.value += effectivePageSize.value
	}

	function handlePageSizeChange(value: string | number | (string | number)[]): void {
		const newSize = Number(Array.isArray(value) ? value[0] : value)
		if (newSize !== localPageSize.value) {
			localPageSize.value = newSize
			currentPage.value = 1
			loadedCount.value = newSize || DEFAULT_PAGE_SIZE
			if (onPageSizeChange) onPageSizeChange(newSize)
		}
	}

	/** Сброс страницы и счётчика подгрузки */
	function resetPage(): void {
		if (loadMode() === 'pagination') {
			currentPage.value = 1
		} else {
			loadedCount.value = effectivePageSize.value
		}
	}

	return { loadMore, handlePageSizeChange, resetPage }
}

export { createTablePaginationActions, DEFAULT_PAGE_SIZE }

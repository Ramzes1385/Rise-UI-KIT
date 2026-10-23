/** Composable: действия данных таблицы, сбрасывающие страницу — фильтры и поиск */
import type { FilterDraft } from '@composables/table/useTableFilter'
import type { TableDataActionsState } from './types/createTableDataActions.types'

function createTableDataActions(state: TableDataActionsState) {
	const { baseAddFilter, baseRemoveFilter, handleSearchInput, resetPage } = state

	function addFilter(draft: FilterDraft): void {
		baseAddFilter(draft)
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

	return { addFilter, removeFilter, handleSearchInputWithReset }
}

export { createTableDataActions }

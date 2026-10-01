/** Composable: действия данных таблицы, сбрасывающие страницу — фильтры и поиск */
import type { Ref } from 'vue'
import type { TableDataActionsState } from './types/createTableDataActions.types'

function createTableDataActions(state: TableDataActionsState) {
	const { baseAddFilter, baseRemoveFilter, handleSearchInput, resetPage } = state

	function addFilter(filterColumn: Ref<string | number>, filterOperator: Ref<string | number>, filterValue: Ref<string>): void {
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

	return { addFilter, removeFilter, handleSearchInputWithReset }
}

export { createTableDataActions }

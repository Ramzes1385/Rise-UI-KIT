/**
 * Composable для управления сортировкой таблицы.
 */
import { ref } from 'vue'

import type { SortDirection, SortState, TableColumn } from '@components/BaseTable/model/BaseTable.types'

import type { UseTableSortOptions, UseTableSortReturn } from './useTableSort.types'

function useTableSort(options: UseTableSortOptions): UseTableSortReturn {
	const { isMultiSort, onSort } = options

	const sortStates = ref<SortState[]>([])

	/** Получить направление сортировки для колонки */
	function getSortDirection(key: string): SortDirection {
		const state = sortStates.value.find(s => s.key === key)
		return state ? state.direction : null
	}

	/** Получить индекс сортировки (для мульти-сортировки) */
	function getSortIndex(key: string): number {
		if (!isMultiSort() || sortStates.value.length <= 1) return 0
		const index = sortStates.value.findIndex(s => s.key === key)
		return index >= 0 ? index + 1 : 0
	}

	/** Обработка сортировки */
	function handleSort(col: TableColumn): void {
		if (!col.isSortable) return

		const existingIndex = sortStates.value.findIndex(s => s.key === col.key)
		let nextDirection: SortDirection = 'asc'

		if (existingIndex >= 0) {
			const currentDir = sortStates.value[existingIndex].direction
			nextDirection = currentDir === 'asc' ? 'desc' : currentDir === 'desc' ? null : 'asc'
		}

		if (isMultiSort()) {
			if (nextDirection === null) {
				sortStates.value = sortStates.value.filter(s => s.key !== col.key)
			} else if (existingIndex >= 0) {
				sortStates.value[existingIndex].direction = nextDirection
			} else {
				sortStates.value.push({ key: col.key, direction: nextDirection })
			}
		} else {
			if (nextDirection === null) {
				sortStates.value = []
			} else {
				sortStates.value = [{ key: col.key, direction: nextDirection }]
			}
		}

		if (onSort) onSort(sortStates.value)
	}

	return {
		sortStates,
		getSortDirection,
		getSortIndex,
		handleSort,
	}
}

export { useTableSort }

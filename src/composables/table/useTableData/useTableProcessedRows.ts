/** Composable: обработанные строки таблицы — поиск, фильтры и сортировка */
import { computed } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableProcessedRowsOptions } from './types/useTableProcessedRows.types'
import { filterRowsBySearch, matchesFilter, sortRowsByStates } from './useTableDataUtils'

function useTableProcessedRows(options: UseTableProcessedRowsOptions) {
	const { rows, columns, searchQuery, activeFilters, sortStates } = options

	/** Обработанные строки (поиск + фильтры + сортировка) */
	return computed((): TableRow[] => {
		let result = [...rows.value]

		if (searchQuery.value) {
			result = filterRowsBySearch(result, searchQuery.value)
		}

		for (const filter of activeFilters.value) {
			result = result.filter(row => matchesFilter(row, filter))
		}

		const activeSorts = sortStates.value.filter(sort => sort.direction)
		if (activeSorts.length > 0) {
			result = sortRowsByStates(result, activeSorts, columns.value)
		}

		return result
	})
}

export { useTableProcessedRows }

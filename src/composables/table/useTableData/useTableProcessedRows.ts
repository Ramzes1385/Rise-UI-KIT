/** Composable: обработанные строки таблицы — поиск, фильтры и сортировка */
import { computed } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableProcessedRowsOptions } from './types/useTableProcessedRows.types'
import { filterRowsBySearch, matchesFilter, sortRowsByStates } from './useTableDataUtils'

function useTableProcessedRows(options: UseTableProcessedRowsOptions) {
	const { rows, columns, searchQuery, activeFilters, sortStates, locale, timeZone } = options

	/** Обработанные строки (поиск + фильтры + сортировка) */
	return computed((): TableRow[] => {
		let result = [...rows.value]

		if (searchQuery.value) {
			result = filterRowsBySearch(result, searchQuery.value, columns.value)
		}

		for (const filter of activeFilters.value) {
			const column = columns.value.find(item => item.key === filter.key)
			result = result.filter(row => matchesFilter(row, filter, { column, timeZone: timeZone?.() }))
		}

		const activeSorts = sortStates.value.filter(sort => sort.direction)
		if (activeSorts.length > 0) {
			result = sortRowsByStates(result, activeSorts, { columns: columns.value, locale: locale?.() })
		}

		return result
	})
}

export { useTableProcessedRows }

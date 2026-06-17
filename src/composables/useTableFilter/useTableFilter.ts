import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ColumnFilter } from '@components/BaseTable/model/BaseTable.types'

import type { UseTableFilterOptions, UseTableFilterReturn } from './useTableFilter.types'

/**
 * Composable для управления фильтрами колонок таблицы.
 */
function useTableFilter(options: UseTableFilterOptions): UseTableFilterReturn {
	const { columns, onFilter } = options

	const activeFilters = ref<ColumnFilter[]>([])

	/** Добавить фильтр */
	function addFilter(
		filterColumn: Ref<string | number>,
		filterOperator: Ref<string | number>,
		filterValue: Ref<string>,
	): void {
		if (!filterColumn.value || !filterValue.value) return
		activeFilters.value.push({
			key: String(filterColumn.value),
			operator: String(filterOperator.value) as ColumnFilter['operator'],
			value: filterValue.value,
		})
		filterValue.value = ''
		if (onFilter) onFilter(activeFilters.value)
	}

	/** Удалить фильтр */
	function removeFilter(index: number): void {
		activeFilters.value.splice(index, 1)
		if (onFilter) onFilter(activeFilters.value)
	}

	/** Метка фильтра */
	function getFilterLabel(filter: ColumnFilter): string {
		const column = columns.value.find(item => item.key === filter.key)
		const operators: Record<string, string> = {
			eq: '=',
			ne: '≠',
			contains: '∋',
			gt: '>',
			lt: '<',
			gte: '≥',
			lte: '≤',
		}
		return `${column?.label || filter.key} ${operators[filter.operator] || filter.operator} ${filter.value}`
	}

	return {
		activeFilters,
		addFilter,
		removeFilter,
		getFilterLabel,
	}
}

export { useTableFilter }

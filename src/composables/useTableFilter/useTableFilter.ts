/**
 * Composable для управления фильтрами колонок таблицы.
 */
import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ColumnFilter } from '@components/BaseTable/model/BaseTable.types'

import type { UseTableFilterOptions, UseTableFilterReturn } from './useTableFilter.types'

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
	function getFilterLabel(f: ColumnFilter): string {
		const col = columns.value.find(c => c.key === f.key)
		const ops: Record<string, string> = {
			eq: '=',
			ne: '≠',
			contains: '∋',
			gt: '>',
			lt: '<',
			gte: '≥',
			lte: '≤',
		}
		return `${col?.label || f.key} ${ops[f.operator] || f.operator} ${f.value}`
	}

	return {
		activeFilters,
		addFilter,
		removeFilter,
		getFilterLabel,
	}
}

export { useTableFilter }

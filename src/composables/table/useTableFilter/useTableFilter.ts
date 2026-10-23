/** Composable: управление фильтрами колонок таблицы */
import { ref } from 'vue'
import type { ColumnFilter } from '@components/BaseTable/types/BaseTable.types'
import { formatFilterLabel, isFilterComplete, VALUE_SEPARATOR } from './useTableFilterUtils'
import type { FilterDraft, UseTableFilterOptions, UseTableFilterReturn } from './types/useTableFilter.types'

function buildFilter(draft: FilterDraft): ColumnFilter {
	const operator = String(draft.operator.value) as ColumnFilter['operator']
	const filter: ColumnFilter = { key: String(draft.column.value), operator, value: draft.value.value }
	if (operator === 'between') filter.valueTo = draft.valueTo?.value ?? ''
	if (operator === 'in') {
		filter.values = [...(draft.values?.value ?? [])]
		filter.value = filter.values.join(VALUE_SEPARATOR)
	}
	return filter
}

function resetDraft(draft: FilterDraft): void {
	draft.value.value = ''
	if (draft.valueTo) draft.valueTo.value = ''
	if (draft.values) draft.values.value = []
}

function useTableFilter(options: UseTableFilterOptions): UseTableFilterReturn {
	const { columns, onFilter } = options

	const activeFilters = ref<ColumnFilter[]>([])

	function emitFilters(): void {
		if (onFilter) onFilter(activeFilters.value.map(filter => ({ ...filter })))
	}

	function addFilter(draft: FilterDraft): void {
		if (!draft.column.value) return
		const filter = buildFilter(draft)
		if (!isFilterComplete(filter)) return
		activeFilters.value.push(filter)
		resetDraft(draft)
		emitFilters()
	}

	function removeFilter(index: number): void {
		activeFilters.value.splice(index, 1)
		emitFilters()
	}

	function getFilterLabel(filter: ColumnFilter): string {
		return formatFilterLabel(
			filter,
			columns.value.find(item => item.key === filter.key),
		)
	}

	return {
		activeFilters,
		addFilter,
		removeFilter,
		getFilterLabel,
	}
}

export { useTableFilter }

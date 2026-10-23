/** Composable: тулбар таблицы — фильтры и настройки колонок */
import { computed, ref } from 'vue'
import type { ColumnFilter, TableColumn } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableToolbarOptions, UseTableToolbarReturn } from './types/useTableToolbar.types'
import {
	getDefaultFilterOperator,
	getFilterKind,
	getFilterOperatorOptions,
	isFilterComplete,
} from '@composables/table/useTableFilter/useTableFilterUtils'

function getSelectValue(value: string | number | (string | number)[]): string | number {
	/* istanbul ignore next -- defensive: BaseSelect emit'ит одиночное значение, array-ветка недостижима */
	return Array.isArray(value) ? value[0] : value
}

/** Черновик фильтра: выбранная колонка, оператор, значения и то, что из них следует для полей тулбара */
function useFilterDraft(filterableColumns: () => TableColumn[]) {
	const filterColumn = ref<string | number>('')
	const filterOperator = ref<string | number>('contains')
	const filterValue = ref('')
	const filterValueTo = ref('')
	const filterValues = ref<string[]>([])

	const selectedColumn = computed(() => filterableColumns().find(column => column.key === filterColumn.value))
	const filterKind = computed(() => getFilterKind(selectedColumn.value))
	const canAddFilter = computed(
		() =>
			Boolean(filterColumn.value) &&
			isFilterComplete({
				key: String(filterColumn.value),
				operator: filterOperator.value as ColumnFilter['operator'],
				value: filterValue.value,
				valueTo: filterValueTo.value,
				values: filterValues.value,
			}),
	)

	function resetDraftValues(): void {
		filterValue.value = ''
		filterValueTo.value = ''
		filterValues.value = []
	}

	function setFilterColumn(value: string | number | (string | number)[]): void {
		filterColumn.value = getSelectValue(value)
		filterOperator.value = getDefaultFilterOperator(selectedColumn.value)
		resetDraftValues()
	}

	function setFilterOperator(value: string | number | (string | number)[]): void {
		filterOperator.value = getSelectValue(value)
		filterValueTo.value = ''
		if (filterOperator.value === 'in') filterValue.value = ''
	}

	return {
		filterColumn,
		filterOperator,
		filterValue,
		filterValueTo,
		filterValues,
		filterKind,
		filterOperatorOptions: computed(() => getFilterOperatorOptions(filterKind.value)),
		filterSelectOptions: computed(() => selectedColumn.value?.filterConfig?.options ?? []),
		filterPlaceholder: computed(() => selectedColumn.value?.filterConfig?.placeholder),
		isRangeOperator: computed(() => filterOperator.value === 'between'),
		canAddFilter,
		setFilterColumn,
		setFilterOperator,
	}
}

/** Также управляет видимостью тулбара */
function useTableToolbar(options: UseTableToolbarOptions): UseTableToolbarReturn {
	const { filterableColumns, hasSearch, hasFilters, hasColumnSettings, addFilter, removeFilter } = options
	const draft = useFilterDraft(filterableColumns)
	const { filterColumn, filterOperator, filterValue, filterValueTo, filterValues } = draft

	const filterColumnOptions = computed(() => filterableColumns().map(column => ({ value: column.key, label: column.label })))

	const showToolbar = computed((): boolean => hasSearch() || hasFilters() || hasColumnSettings())

	return {
		...draft,
		isSettingsOpen: ref(false),
		filterColumnOptions,
		showToolbar,
		getSelectValue,
		handleAddFilter: () =>
			addFilter({ column: filterColumn, operator: filterOperator, value: filterValue, valueTo: filterValueTo, values: filterValues }),
		handleRemoveFilter: (index: number): void => removeFilter(index),
	}
}

export { useTableToolbar }

/** Composable: тулбар таблицы — фильтры и настройки колонок */
import { computed, ref } from 'vue'
import { UI_FILTER } from '@/locales/messages'
import type { UseTableToolbarOptions, UseTableToolbarReturn } from './useTableToolbar.types'

/** Операторы фильтра. Подпись «Содержит» — на текущем языке, поэтому список собирается при чтении */
const getFilterOperatorOptions = () => [
	{ value: 'contains', label: UI_FILTER.CONTAINS },
	{ value: 'eq', label: '=' },
	{ value: 'ne', label: '≠' },
	{ value: 'gt', label: '>' },
	{ value: 'gte', label: '≥' },
	{ value: 'lt', label: '<' },
	{ value: 'lte', label: '≤' },
]

/** Composable для тулбара таблицы — фильтры, настройки колонок, видимость тулбара. */
function useTableToolbar(options: UseTableToolbarOptions): UseTableToolbarReturn {
	const { filterableColumns, hasSearch, hasFilters, hasColumnSettings, slots, addFilter, removeFilter } = options

	const filterColumn = ref<string | number>('')
	const filterOperator = ref<string | number>('contains')
	const filterValue = ref('')
	const isSettingsOpen = ref(false)

	const filterColumnOptions = computed(() => {
		return filterableColumns().map(column => ({
			value: column.key,
			label: column.label,
		}))
	})

	const showToolbar = computed((): boolean => {
		return hasSearch() || hasFilters() || hasColumnSettings() || !!slots['toolbar-prepend'] || !!slots['toolbar-append']
	})

	function getSelectValue(value: string | number | (string | number)[]): string | number {
		/* istanbul ignore next -- defensive: BaseSelect emit'ит одиночное значение, array-ветка недостижима */
		return Array.isArray(value) ? value[0] : value
	}

	function setFilterColumn(value: string | number | (string | number)[]): void {
		filterColumn.value = getSelectValue(value)
	}

	function setFilterOperator(value: string | number | (string | number)[]): void {
		filterOperator.value = getSelectValue(value)
	}

	function handleAddFilter(): void {
		addFilter(filterColumn, filterOperator, filterValue)
	}

	function handleRemoveFilter(index: number): void {
		removeFilter(index)
	}

	return {
		filterColumn,
		filterOperator,
		filterValue,
		isSettingsOpen,
		filterColumnOptions,
		filterOperatorOptions: computed(getFilterOperatorOptions),
		showToolbar,
		getSelectValue,
		setFilterColumn,
		setFilterOperator,
		handleAddFilter,
		handleRemoveFilter,
	}
}

export { useTableToolbar }

/** Composable: подключение составных частей таблицы — колонки, данные, выбор строк, раскрытие и тулбар */
import { computed } from 'vue'
import { useTableExpand } from '@composables/table/useTableExpand'
import { useTableCompositionData } from './useTableCompositionData'
import { useTableColumns } from '@composables/table/useTableColumns'
import { useTableToolbar } from '@composables/table/useTableToolbar'
import { useTableSelection } from '@composables/table/useTableSelection'
import type { UseTableCompositionOptions } from './types/useTableComposition.types'

function useTableCompositionModel(options: UseTableCompositionOptions) {
	const { rows, columns, pageSize, emit, selectedIds, selectAllScope } = options
	const { isResizable, hasRowNumber, isSelectable, hasSearch, hasFilters, hasColumnSettings } = options

	const tableColumns = useTableColumns({
		columns,
		rows,
		isResizable: () => isResizable.value,
		hasRowNumber: () => hasRowNumber.value,
		isSelectable: () => isSelectable.value,
		pageSize: () => pageSize.value,
		emit,
	})
	const { localColumns, filterableColumns } = tableColumns

	const data = useTableCompositionData(options, localColumns)
	const { processedRows, displayedRows, addFilter, removeFilter } = data
	const selectScopeRows = computed(() => {
		if (selectAllScope?.value === 'page') return displayedRows.value
		return selectAllScope?.value === 'all' ? rows.value : processedRows.value
	})

	// «Выбрать все» действует на область selectAllScope: по умолчанию строки, прошедшие поиск и фильтры, а не все rows
	const selection = useTableSelection({
		rows,
		filteredRows: selectScopeRows,
		visibleRows: processedRows,
		isKeepingOutOfScope: () => selectAllScope?.value === 'page',
		onSelect: selectedRows => emit('select', selectedRows),
		selectedIds: () => selectedIds?.value,
		onSelectedIdsChange: ids => emit('update:selectedIds', ids),
	})

	const expand = useTableExpand({ rows: () => rows.value, expandedIds: () => options.expandedIds?.value, emit })

	const toolbar = useTableToolbar({
		filterableColumns: () => filterableColumns.value,
		hasSearch: () => hasSearch.value,
		hasFilters: () => hasFilters.value,
		hasColumnSettings: () => hasColumnSettings.value,
		addFilter,
		removeFilter,
	})

	return { tableColumns, data, selection, expand, toolbar }
}

export { useTableCompositionModel }

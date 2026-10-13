/** Composable: подключение составных частей таблицы — колонки, данные, выбор строк, раскрытие и тулбар */
import { useTableData } from '@composables/table/useTableData'
import { useTableExpand } from '@composables/table/useTableExpand'
import { useTableColumns } from '@composables/table/useTableColumns'
import { useTableToolbar } from '@composables/table/useTableToolbar'
import { useTableSelection } from '@composables/table/useTableSelection'
import type { UseTableCompositionOptions } from './types/useTableComposition.types'

function useTableCompositionModel(options: UseTableCompositionOptions) {
	const { rows, columns, loadMode, pageSize, hasMore, isMultiSort, searchDebounce, sortLocale, emit } = options
	const { page, totalRows, selectedIds, timeZone } = options
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

	const data = useTableData({
		rows,
		columns: localColumns,
		loadMode: () => loadMode.value,
		pageSize,
		hasMore: () => hasMore?.value ?? false,
		isMultiSort: () => isMultiSort.value,
		searchDebounce: () => searchDebounce.value,
		sortLocale: () => sortLocale?.value,
		timeZone: () => timeZone?.value,
		onSearch: (q: string) => emit('search', q),
		onSort: states => emit('sort', states),
		onFilter: filters => emit('filter', filters),
		onPageSizeChange: (size: number) => {
			emit('page-size-change', size)
			emit('update:pageSize', size)
		},
		page: () => page?.value,
		onPageChange: (current: number) => {
			emit('page-change', current)
			emit('update:page', current)
		},
		totalRows: () => totalRows?.value,
	})
	const { processedRows, addFilter, removeFilter } = data

	// «Выбрать все» действует на строки, прошедшие поиск и фильтры, а не на все переданные rows
	const selection = useTableSelection({
		rows,
		filteredRows: processedRows,
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

/** Утилиты: выборка полей составных частей таблицы в публичный результат useTableComposition */
import type { UseTableColumnsReturn } from '@composables/table/useTableColumns'
import type { UseTableToolbarReturn } from '@composables/table/useTableToolbar'
import type { UseTableDataReturn } from '@composables/table/useTableData/types/useTableData.types'

/** Состояние данных: поиск, фильтры, страницы и строки */
function pickDataState(data: UseTableDataReturn) {
	const { searchQuery, activeFilters, currentPage, localPageSize, processedRows, displayedRows, totalPages, visiblePages, hasMoreRows } =
		data
	return { searchQuery, activeFilters, currentPage, localPageSize, processedRows, displayedRows, totalPages, visiblePages, hasMoreRows }
}

/** Состояние и действия колонок без внутренних filterableColumns и snapshotColumns */
function pickColumnsState(tableColumns: UseTableColumnsReturn) {
	const { localColumns, visibleColumns, columnWidths, useFixedLayout, totalCols, hasExpandableRows, skeletonRows } = tableColumns
	const { isColumnResizable, getColumnStyle, toggleColumnVisibility, formatCellValue } = tableColumns
	return {
		localColumns,
		visibleColumns,
		columnWidths,
		useFixedLayout,
		totalCols,
		hasExpandableRows,
		skeletonRows,
		isColumnResizable,
		getColumnStyle,
		toggleColumnVisibility,
		formatCellValue,
	}
}

/** Обработчики данных: сортировка, поиск, метки фильтров и размер страницы */
function pickDataHandlers(data: UseTableDataReturn) {
	const { getSortDirection, getSortIndex, handleSort, handleSearchInput, getFilterLabel, handlePageSizeChange } = data
	return { getSortDirection, getSortIndex, handleSort, handleSearchInput, getFilterLabel, handlePageSizeChange }
}

/** Состояние и действия тулбара без внутреннего getSelectValue */
function pickToolbarState(toolbar: UseTableToolbarReturn) {
	const { filterColumn, filterOperator, filterValue, filterValueTo, filterValues, isSettingsOpen, showToolbar } = toolbar
	const { filterColumnOptions, filterOperatorOptions, filterKind, filterSelectOptions, filterPlaceholder } = toolbar
	const { isRangeOperator, canAddFilter, setFilterColumn, setFilterOperator, handleAddFilter, handleRemoveFilter } = toolbar
	return {
		filterColumn,
		filterOperator,
		filterValue,
		filterValueTo,
		filterValues,
		isSettingsOpen,
		filterColumnOptions,
		filterOperatorOptions,
		filterKind,
		filterSelectOptions,
		filterPlaceholder,
		isRangeOperator,
		canAddFilter,
		showToolbar,
		setFilterColumn,
		setFilterOperator,
		handleAddFilter,
		handleRemoveFilter,
	}
}

export { pickColumnsState, pickDataHandlers, pickDataState, pickToolbarState }

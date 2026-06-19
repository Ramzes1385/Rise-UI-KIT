import { computed, watch } from 'vue'
import { useColumnResize } from '@composables/useColumnResize'
import { useTableColumns } from '@composables/useTableColumns'
import { useTableData } from '@composables/useTableData'
import { useTableExpand } from '@composables/useTableExpand'
import { useTableSelection } from '@composables/useTableSelection'
import { useTableToolbar } from '@composables/useTableToolbar'
import {
	TABLE_MIN_COL_WIDTH,
} from '@constants/table'
import { toHTMLElement } from '@utils/domUtils'
import { calcPageInfo } from '@utils/paginationUtils'
import { calcRowNumber } from '@utils/tableUtils'
import type { TableColumn, TableRow } from '../model/BaseTable.types'
import type { UseTableCompositionOptions } from './useTableComposition.types'

/** Описание: агрегирует логику таблицы — сортировка, фильтрация, поиск, пагинация, выбор строк, раскрытие, ресайз колонок и infinite scroll */
function useTableComposition(options: UseTableCompositionOptions) {
	const {
		rows,
		columns,
		loadMode,
		pageSize,
		isMultiSort,
		searchDebounce,
		isResizable,
		hasRowNumber,
		isSelectable,
		hasSearch,
		hasFilters,
		hasColumnSettings,
		isLoading,
		pageSizeOptions,
		infiniteScrollThreshold,
		emit,
		slots,
	} = options

	const {
		localColumns,
		visibleColumns,
		columnWidths,
		useFixedLayout,
		totalCols,
		filterableColumns,
		hasExpandableRows,
		skeletonRows,
		isColumnResizable,
		getColumnStyle,
		toggleColumnVisibility,
		formatCellValue,
	} = useTableColumns({
		columns,
		rows,
		isResizable: () => isResizable.value,
		hasRowNumber: () => hasRowNumber.value,
		isSelectable: () => isSelectable.value,
		pageSize: () => pageSize.value,
		emit,
	})

	const {
		searchQuery,
		activeFilters,
		currentPage,
		localPageSize,
		processedRows,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
		getSortDirection,
		getSortIndex,
		handleSort,
		handleSearchInput,
		addFilter,
		removeFilter,
		getFilterLabel,
		handlePageSizeChange,
		loadMore,
		resetPage,
	} = useTableData({
		rows,
		columns: localColumns,
		loadMode: () => loadMode.value,
		pageSize,
		isMultiSort: () => isMultiSort.value,
		searchDebounce: () => searchDebounce.value,
		onSearch: (q: string) => emit('search', q),
		onSort: states => emit('sort', states),
		onFilter: filters => emit('filter', filters),
		onPageSizeChange: (size: number) => emit('page-size-change', size),
	})

	const { isAllSelected, isSelected, toggleRow: toggleRowSelection, toggleAll: toggleAllRows } = useTableSelection({
		rows,
		onSelect: selectedRows => emit('select', selectedRows),
	})

	const { isExpanded, toggleExpand, handleRowClick } = useTableExpand({
		rows: () => rows.value,
		emit,
	})

	const {
		filterColumn,
		filterOperator,
		filterValue,
		isSettingsOpen,
		filterColumnOptions,
		filterOperatorOptions,
		showToolbar,
		setFilterColumn,
		setFilterOperator,
		handleAddFilter,
		handleRemoveFilter,
	} = useTableToolbar({
		filterableColumns: () => filterableColumns.value,
		hasSearch: () => hasSearch.value,
		hasFilters: () => hasFilters.value,
		hasColumnSettings: () => hasColumnSettings.value,
		slots,
		addFilter,
		removeFilter,
	})

	watch(currentPage, newPage => {
		emit('page-change', newPage)
	})

	const pageSizeSelectOptions = computed(() => {
		return pageSizeOptions.value.map(size => ({
			value: String(size),
			label: String(size),
		}))
	})

	const paginationInfo = computed((): string => {
		return calcPageInfo({
			current: currentPage.value,
			pageSize: localPageSize.value,
			total: processedRows.value.length,
		})
	})

	function getRowNumber(index: number): number {
		return calcRowNumber({
			index,
			currentPage: currentPage.value,
			pageSize: localPageSize.value,
			loadMode: loadMode.value,
		})
	}

	function toggleRow(row: TableRow): void {
		toggleRowSelection(row)
	}

	function toggleAll(): void {
		toggleAllRows()
	}

	function handleLoadMore(): void {
		loadMore()
		emit('load-more')
	}

	function handleScroll(e: Event): void {
		if (loadMode.value !== 'infinite' || !hasMoreRows.value || isLoading.value) return

		const target = toHTMLElement(e.target)
		if (!target) return
		const { scrollTop, scrollHeight, clientHeight } = target

		if (scrollHeight - scrollTop - clientHeight < infiniteScrollThreshold) {
			handleLoadMore()
		}
	}

	const { startResize: startColumnResize } = useColumnResize({
		columns: localColumns,
		visibleColumns,
		minWidth: TABLE_MIN_COL_WIDTH,
		onColumnResize: (key, width) => emit('column-resize', key, width),
		onColumnsChange: columns => emit('columns-change', columns),
	})

	function startResize(event: MouseEvent, column: TableColumn): void {
		startColumnResize(event, column.key)
	}

	watch(
		() => rows.value,
		() => {
			resetPage()
		},
	)

	return {
		searchQuery,
		activeFilters,
		currentPage,
		localPageSize,
		processedRows,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
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
		isAllSelected,
		isSelected,
		isExpanded,
		toggleExpand,
		handleRowClick,
		getSortDirection,
		getSortIndex,
		handleSort,
		handleSearchInput,
		getFilterLabel,
		handlePageSizeChange,
		filterColumn,
		filterOperator,
		filterValue,
		isSettingsOpen,
		filterColumnOptions,
		filterOperatorOptions,
		showToolbar,
		setFilterColumn,
		setFilterOperator,
		handleAddFilter,
		handleRemoveFilter,
		pageSizeSelectOptions,
		paginationInfo,
		getRowNumber,
		toggleRow,
		toggleAll,
		handleLoadMore,
		handleScroll,
		startResize,
	}
}

export { useTableComposition }
export type { UseTableCompositionOptions }

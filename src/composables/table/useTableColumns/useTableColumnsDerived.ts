/** Composable: производные состояния колонок таблицы — видимые и фильтруемые колонки, ширины, skeleton-строки */
import { computed } from 'vue'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'
import { calcColumnWidths, calcTotalColumns } from '@utils/navigation/tableUtils'
import type { UseTableColumnsDerivedOptions } from './types/useTableColumnsDerived.types'

/** Строк скелетона, когда размер страницы не задан */
const DEFAULT_SKELETON_ROWS = 5

function useTableColumnsDerived(options: UseTableColumnsDerivedOptions) {
	const { localColumns, rows, isResizable, hasRowNumber, isSelectable, pageSize } = options

	const visibleColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden)
	})

	const skeletonRows = computed((): number => {
		return pageSize() || DEFAULT_SKELETON_ROWS
	})

	const filterableColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden && column.isFilterable !== false)
	})

	const hasExpandableRows = computed((): boolean => {
		return rows.value.some(row => row.isExpandable || (row.children && row.children.length > 0))
	})

	const totalCols = computed((): number => {
		return calcTotalColumns(visibleColumns.value.length, {
			isSelectable: isSelectable(),
			hasRowNumber: hasRowNumber(),
			hasExpandableRows: hasExpandableRows.value,
		})
	})

	const useFixedLayout = computed((): boolean => {
		return isResizable() || visibleColumns.value.some(column => column.flex || column.width)
	})

	const columnWidths = computed((): string[] => {
		return calcColumnWidths(visibleColumns.value)
	})

	return {
		visibleColumns,
		skeletonRows,
		filterableColumns,
		hasExpandableRows,
		totalCols,
		useFixedLayout,
		columnWidths,
	}
}

export { useTableColumnsDerived }

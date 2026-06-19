import type { BaseTableEmits, TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { ComputedRef, Ref } from 'vue'

export interface UseTableColumnsOptions {
	columns: Ref<TableColumn[]>
	rows: Ref<TableRow[]>
	isResizable: () => boolean
	hasRowNumber: () => boolean
	isSelectable: () => boolean
	pageSize: () => number
	emit: BaseTableEmits
}

export interface UseTableColumnsReturn {
	localColumns: Ref<TableColumn[]>
	visibleColumns: ComputedRef<TableColumn[]>
	columnWidths: ComputedRef<string[]>
	useFixedLayout: ComputedRef<boolean>
	totalCols: ComputedRef<number>
	filterableColumns: ComputedRef<TableColumn[]>
	hasExpandableRows: ComputedRef<boolean>
	skeletonRows: ComputedRef<number>
	isColumnResizable: (column: TableColumn) => boolean
	getColumnStyle: (column: TableColumn) => Record<string, string>
	toggleColumnVisibility: (column: TableColumn) => void
	formatCellValue: (column: TableColumn, row: TableRow) => string
}

export interface ResizeColumn {
	key: string
	width?: string
}

export interface ResizeState {
	isResizing: boolean
	columnKey: string
	nextColumnKey: string
	startX: number
	startWidth: number
	nextStartWidth: number
}

export interface UseColumnResizeParams<TColumn extends ResizeColumn> {
	columns: { value: TColumn[] }
	visibleColumns: { value: TColumn[] }
	minWidth: number
	onColumnResize: (key: string, width: number) => void
	onColumnsChange: (columns: TColumn[]) => void
}

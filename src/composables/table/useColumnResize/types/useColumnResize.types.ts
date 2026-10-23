export interface ResizeColumn {
	key: string
	width?: string
	/** Наименьшая ширина колонки в px (`'120px'`); другие единицы не учитываются */
	minWidth?: string
	/** Наибольшая ширина колонки в px (`'400px'`); другие единицы не учитываются */
	maxWidth?: string
}

export interface ResizeState {
	isResizing: boolean
	columnKey: string
	nextColumnKey: string
	startX: number
	/** Таблица пишется справа налево: граница колонки с её конца, расширение — сдвиг указателя влево */
	isReversed?: boolean
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

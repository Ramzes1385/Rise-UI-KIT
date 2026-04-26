/** Параметры для расчёта номера строки */
interface RowNumberOptions {
	/** Индекс строки в текущей странице */
	index: number
	/** Текущая страница */
	currentPage: number
	/** Размер страницы */
	pageSize: number
	/** Режим загрузки */
	loadMode: string
}

/** Параметры для стиля колонки */
interface ColumnStyleOptions {
	/** Минимальная ширина */
	minWidth?: string
	/** Максимальная ширина */
	maxWidth?: string
}

/** Рассчитать номер строки с учётом пагинации */
function calcRowNumber(options: RowNumberOptions): number {
	if (options.loadMode === 'pagination' && options.pageSize) {
		return (options.currentPage - 1) * options.pageSize + options.index + 1
	}
	return options.index + 1
}

/** Получить CSS-стиль колонки (min/max width) */
function getColumnStyle(options: ColumnStyleOptions): Record<string, string> {
	const styles: Record<string, string> = {}
	if (options.minWidth) styles.minWidth = options.minWidth
	if (options.maxWidth) styles.maxWidth = options.maxWidth
	return styles
}

/** Рассчитать общее количество колонок с учётом доп. столбцов */
function calcTotalColumns(
	visibleCount: number,
	isSelectable: boolean,
	hasRowNumber: boolean,
	hasExpandableRows: boolean,
): number {
	let count = visibleCount
	if (isSelectable) count++
	if (hasRowNumber) count++
	if (hasExpandableRows) count++
	return count
}

/** Рассчитать ширины колонок для colgroup с учётом flex */
function calcColumnWidths(columns: Array<{ width?: string; flex?: number }>): string[] {
	const flexCols = columns.filter(c => c.flex)
	const totalFlex = flexCols.reduce((sum, c) => sum + (c.flex || 0), 0)

	return columns.map(col => {
		if (col.width) return col.width
		if (col.flex && totalFlex > 0) {
			return `${(col.flex / totalFlex) * 100}%`
		}
		return 'auto'
	})
}

export { calcColumnWidths, calcRowNumber, calcTotalColumns, getColumnStyle }
export type { ColumnStyleOptions, RowNumberOptions }

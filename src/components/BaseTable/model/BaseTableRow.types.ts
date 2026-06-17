import type { TableColumn, TableRow } from '../model/BaseTable.types'

/** Props компонента BaseTableRow */
export interface BaseTableRowProps {
	/** Данные строки */
	row: TableRow
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Индекс строки в массиве */
	rowIndex: number
	/** Порядковый номер строки (отображаемый) */
	rowNumber: number
	/** Показывать чекбокс выбора строки */
	isSelectable: boolean
	/** Показывать номер строки */
	hasRowNumber: boolean
	/** Поддержка раскрываемых строк */
	hasExpandableRows: boolean
	/** Выбрана ли строка */
	isSelected: boolean
	/** Раскрыта ли строка */
	isExpanded: boolean
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** CSS-класс для строки tr */
	trClass?: string
	/** CSS-класс для ячейки td */
	tdClass?: string
	/** Получение CSS-стилей для колонки */
	getColumnStyle: (column: TableColumn) => Record<string, string>
	/** Форматирование значения ячейки */
	formatCellValue: (column: TableColumn, row: TableRow) => string
}

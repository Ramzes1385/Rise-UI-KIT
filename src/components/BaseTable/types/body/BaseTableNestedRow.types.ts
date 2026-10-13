import type { NestedTableConfig, TableColumn, TableRow } from '../BaseTable.types'

export interface BaseTableNestedRowProps {
	/** Версия слотов `cell-*` приложения: растёт, когда они заменены, и вложенные строки перерисовываются */
	slotsVersion?: number
	/** Родительская строка (может содержать children) */
	row: TableRow
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Конфигурация вложенной таблицы */
	nestedConfig?: NestedTableConfig
	/** Общее количество колонок (для colspan) */
	totalColumns: number
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** Показывать чекбоксы для выбора строк */
	isSelectable: boolean
	/** Показывать номера строк */
	hasRowNumber: boolean
	/** CSS-класс для строки tr */
	trClass?: string
	/** CSS-класс для ячейки td */
	tdClass?: string
	/** Проверка, раскрыта ли строка */
	isExpanded: (row: TableRow) => boolean
	/** Получение CSS-стилей для колонки */
	getColumnStyle: (column: TableColumn) => Record<string, string>
	/** Форматирование значения ячейки */
	formatCellValue: (column: TableColumn, row: TableRow) => string
}

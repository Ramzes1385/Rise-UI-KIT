import type { TableRow } from './BaseTable.types'

export interface BaseTableExpandedRowProps {
	/** Данные строки */
	row: TableRow
	/** Общее количество колонок (для colspan) */
	totalColumns: number
	/** CSS-класс для строки tr */
	trClass?: string
	/** CSS-класс для ячейки td */
	tdClass?: string
	/** Проверка, раскрыта ли строка */
	isExpanded: (row: TableRow) => boolean
}

export interface BaseTableExpandedRowSlots {
	/** Контент раскрытой строки */
	'expanded-content'?: (props: { row: TableRow }) => unknown
}

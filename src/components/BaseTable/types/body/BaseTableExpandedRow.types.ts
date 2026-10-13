import type { TableRow } from '../BaseTable.types'

export interface BaseTableExpandedRowProps {
	/** Версия слота `expanded-content` приложения: растёт, когда он заменён, и строка перерисовывается */
	slotsVersion?: number
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

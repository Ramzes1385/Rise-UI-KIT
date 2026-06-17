import type { SortDirection, TableColumn } from './BaseTable.types'

/** Props компонента BaseTableHeader */
export interface BaseTableHeaderProps {
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Показывать чекбокс «Выбрать все» */
	isSelectable: boolean
	/** Показывать колонку с номерами строк */
	hasRowNumber: boolean
	/** Показывать колонку раскрытия строк */
	hasExpandableRows: boolean
	/** Все ли строки выбраны */
	isAllSelected: boolean
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** Включена ли множественная сортировка */
	isMultiSort: boolean
	/** CSS-класс для элемента thead */
	theadClass?: string
	/** CSS-класс для строки tr */
	trClass?: string
	/** CSS-класс для ячейки th */
	thClass?: string
	/** Получение направления сортировки для колонки */
	getSortDirection: (key: string) => SortDirection
	/** Получение индекса сортировки (для мультисортировки) */
	getSortIndex: (key: string) => number
	/** Проверка, можно ли ресайзить колонку */
	isColumnResizable: (column: TableColumn) => boolean
	/** Получение CSS-стилей для колонки */
	getColumnStyle: (column: TableColumn) => Record<string, string>
}

/** Emits компонента BaseTableHeader */
export interface BaseTableHeaderEmits {
	(event: 'toggle-all'): void
	(event: 'sort', column: TableColumn): void
	(event: 'resize-start', value: MouseEvent, column: TableColumn): void
}

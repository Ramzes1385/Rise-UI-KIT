import type { SortDirection, TableColumn } from '../BaseTable.types'

export interface BaseTableHeaderProps {
	/** Виртуальная прокрутка: строка заголовка получает aria-rowindex="1" */
	isVirtual?: boolean
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
	/** Выбрана часть строк: «Выбрать все» в частичном состоянии */
	isSomeSelected: boolean
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

export interface BaseTableHeaderEmits {
	(event: 'toggle-all'): void
	(event: 'sort', column: TableColumn): void
	(event: 'resize-start', value: MouseEvent, column: TableColumn): void
	(event: 'resize-by', handle: HTMLElement, column: TableColumn, delta: number): void
}

export interface BaseTableHeaderSlots {
	/** Кастомный рендер заголовка колонки (`header-<columnKey>`) */
	[name: `header-${string}`]: (props: { column: TableColumn; sortDirection: SortDirection }) => unknown
}

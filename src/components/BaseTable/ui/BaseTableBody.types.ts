import type { LoadMode, NestedTableConfig, TableColumn, TableRow } from '../model/BaseTable.types'

/** Props компонента BaseTableBody */
export interface BaseTableBodyProps {
	/** Данные строк таблицы */
	rows: TableRow[]
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Текст при пустой таблице */
	emptyText: string
	/** Флаг загрузки данных */
	isLoading: boolean
	/** Количество строк-скелетонов при загрузке */
	skeletonRows: number
	/** Показывать чекбоксы для выбора строк */
	isSelectable: boolean
	/** Показывать номера строк */
	hasRowNumber: boolean
	/** Поддержка раскрываемых строк */
	hasExpandableRows: boolean
	/** Общее количество колонок (для colspan) */
	totalColumns: number
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** Режим подгрузки данных (пагинация / бесконечная прокрутка / кнопка) */
	loadMode: LoadMode
	/** Конфигурация вложенной таблицы */
	nestedConfig?: NestedTableConfig
	/** CSS-класс для элемента tbody */
	tbodyClass?: string
	/** CSS-класс для строки tr */
	trClass?: string
	/** CSS-класс для ячейки td */
	tdClass?: string
	/** Проверка, выбрана ли строка */
	isSelected: (row: TableRow) => boolean
	/** Проверка, раскрыта ли строка */
	isExpanded: (row: TableRow) => boolean
	/** Получение номера строки по индексу */
	getRowNumber: (index: number) => number
	/** Получение CSS-стилей для колонки */
	getColumnStyle: (column: TableColumn) => Record<string, string>
	/** Форматирование значения ячейки */
	formatCellValue: (column: TableColumn, row: TableRow) => string
}

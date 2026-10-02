import type { LoadMode, NestedTableConfig, TableColumn, TableRow } from '../BaseTable.types'

export interface BaseTableBodyProps {
	/** Данные строк таблицы */
	rows: TableRow[]
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Текст при пустой таблице */
	emptyText: string
	/** Строки есть, но поиск или фильтры скрыли все */
	isFiltered?: boolean
	/** Строки активируются с клавиатуры: у них roving tabindex, Enter и пробел дают `row-click` */
	isRowInteractive?: boolean
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
	/** Виртуальная прокрутка: rows — видимая часть, распорки сверху и снизу, у строк data-virtual-index и aria-rowindex */
	isVirtual?: boolean
	/** Индекс первой строки из rows среди всех строк */
	indexOffset?: number
	/** Высота распорок до и после видимых строк, px */
	paddingStart?: number
	paddingEnd?: number
}

export interface BaseTableBodyEmits {
	(event: 'row-click', row: TableRow): void
	(event: 'toggle-row', row: TableRow): void
	(event: 'toggle-expand', row: TableRow): void
}

export interface BaseTableBodySlots {
	/** Контент при пустой таблице */
	empty?: (props: { isFiltered: boolean }) => unknown
	/** Контент раскрытой строки */
	'expanded-content'?: (props: { row: TableRow }) => unknown
	/** Кастомный рендер ячейки по ключу колонки (`cell-<columnKey>`) */
	[name: `cell-${string}`]: (props: { row: TableRow; value: unknown; column: TableColumn; index?: number }) => unknown
}

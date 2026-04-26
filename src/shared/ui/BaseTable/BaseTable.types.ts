import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения таблицы */
export const TABLE_VARIANTS = ['default', 'bordered', 'striped'] as const

/**
 * Направление сортировки
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Тип сортировки
 */
export type SortType = 'string' | 'number' | 'date'

/**
 * Оператор фильтра
 */
export type FilterOperator = 'eq' | 'ne' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in'

/**
 * Тип фильтра колонки
 */
export type ColumnFilterType = 'text' | 'select' | 'range' | 'date' | 'multi-select'

/**
 * Опция фильтра-селекта
 */
export interface FilterOption {
	/** Значение */
	value: string
	/** Метка */
	label: string
}

/**
 * Настройки фильтра колонки
 */
export interface ColumnFilterConfig {
	/** Тип фильтра */
	type: ColumnFilterType
	/** Опции (для select/multi-select) */
	options?: FilterOption[]
	/** Плейсхолдер */
	placeholder?: string
}

/**
 * Определение колонки
 */
export interface TableColumn {
	/** Уникальный ключ */
	key: string
	/** Заголовок */
	label: string
	/** Ширина (CSS значение: '200px', '1fr', 'auto') */
	width?: string
	/** Минимальная ширина */
	minWidth?: string
	/** Максимальная ширина */
	maxWidth?: string
	/** Flex-коэффициент (резиновая колонка) */
	flex?: number
	/** Тип сортировки */
	sortType?: SortType
	/** Сортируемая */
	isSortable?: boolean
	/** Фильтруемая */
	isFilterable?: boolean
	/** Настройки фильтра */
	filterConfig?: ColumnFilterConfig
	/** Выравнивание */
	align?: 'left' | 'center' | 'right'
	/** Скрываемая */
	isHidden?: boolean
	/** Прилипающая */
	isSticky?: 'left' | 'right'
	/** Ресайзимая */
	isResizable?: boolean
	/** Класс ячейки */
	cellClass?: string
	/** Форматтер значения */
	formatter?: (value: unknown, row: TableRow) => string
}

/**
 * Состояние сортировки
 */
export interface SortState {
	/** Ключ колонки */
	key: string
	/** Направление */
	direction: SortDirection
}

/**
 * Фильтр колонки
 */
export interface ColumnFilter {
	/** Ключ колонки */
	key: string
	/** Оператор */
	operator: FilterOperator
	/** Значение */
	value: string
	/** Второе значение (для between) */
	valueTo?: string
}

/**
 * Определение вложенной таблицы
 */
export interface NestedTableConfig {
	/** Колонки вложенной таблицы */
	columns: TableColumn[]
	/** Ключ данных для дочерних строк */
	childrenKey: string
	/** Заголовок вложенной таблицы */
	title?: string
}

/**
 * Определение строки (с поддержкой вложенности)
 */
export interface TableRow {
	/** Уникальный ID */
	id: string | number
	/** Данные строки */
	data: Record<string, unknown>
	/** Дочерние строки */
	children?: TableRow[]
	/** Можно ли раскрыть строку (даже если children пока нет) */
	isExpandable?: boolean
	/** Раскрыта ли строка */
	isExpanded?: boolean
	/** Выбрана ли */
	isSelected?: boolean
	/** Отключена */
	isDisabled?: boolean
	/** Класс строки */
	rowClass?: string
	/** Уровень вложенности (внутренний) */
	_depth?: number
}

/**
 * Вариант таблицы
 */
export type TableVariant = (typeof TABLE_VARIANTS)[number]

/**
 * Режим подгрузки данных
 */
export type LoadMode = 'pagination' | 'infinite' | 'button'

/**
 * Пропсы компонента BaseTable
 */
export interface BaseTableProps {
	/** Колонки */
	columns: TableColumn[]
	/** Строки */
	rows: TableRow[]
	/** Вариант отображения */
	variant?: TableVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Загрузка */
	isLoading?: boolean
	/** Пустое сообщение */
	emptyText?: string
	/** Высота таблицы (для фиксированного заголовка) */
	height?: string
	/** Выделяемые строки */
	isSelectable?: boolean
	/** Показывать поиск */
	hasSearch?: boolean
	/** Показывать фильтры */
	hasFilters?: boolean
	/** Размер страницы */
	pageSize?: number
	/** Варианты размера страницы для селектора */
	pageSizeOptions?: number[]
	/** Режим подгрузки */
	loadMode?: LoadMode
	/** Дебаунс поиска (мс) */
	searchDebounce?: number
	/** Конфиг вложенной таблицы */
	nestedConfig?: NestedTableConfig
	/** Множественная сортировка */
	isMultiSort?: boolean
	/** Показывать настройки колонок */
	hasColumnSettings?: boolean
	/** Показывать номер строки */
	hasRowNumber?: boolean
	/** Показывать селектор размера страницы */
	hasPageSizeSelector?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Базовый padding ячеек (px). Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px */
	padding?: number
}

/**
 * События компонента BaseTable
 */
export interface BaseTableEmits {
	(event: 'sort', state: SortState[]): void
	(event: 'filter', filters: ColumnFilter[]): void
	(event: 'search', query: string): void
	(event: 'select', rows: TableRow[]): void
	(event: 'expand', row: TableRow): void
	(event: 'page-change', page: number): void
	(event: 'page-size-change', size: number): void
	(event: 'load-more'): void
	(event: 'row-click', row: TableRow): void
	(event: 'column-resize', key: string, width: number): void
	(event: 'columns-change', columns: TableColumn[]): void
}

/**
 * Слоты компонента BaseTable
 */
export interface BaseTableSlots {
	default?: () => unknown
	header?: () => unknown
	footer?: () => unknown
	empty?: () => unknown
	'toolbar-prepend'?: () => unknown
	'toolbar-append'?: () => unknown
	'expanded-content'?: (props: { row: TableRow }) => unknown
	pagination?: (props: {
		currentPage: number
		totalPages: number
		visiblePages: number[]
		pageSize: number
		pageSizeOptions: number[]
		paginationInfo: string
		pageSizeSelectOptions: Array<{ value: string; label: string }>
		handlePageSizeChange: (value: string | number) => void
	}) => unknown
}

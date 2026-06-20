import type { BaseComponentProps } from '../../../types/base.types'
import type { PaddingProp } from '@composables/usePadding'
import type { VisiblePageItem } from '@utils/paginationUtils/paginationUtils.types'
import type { InjectionKey } from 'vue'

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
 * Конфигурация функций таблицы (замена boolean-пропсов при мажорном релизе)
 */
export interface TableFeaturesConfig {
	/** Показывать поиск */
	search?: boolean
	/** Показывать фильтры */
	filters?: boolean
	/** Показывать настройки колонок */
	columnSettings?: boolean
	/** Показывать номер строки */
	rowNumber?: boolean
	/** Показывать селектор размера страницы */
	pageSizeSelector?: boolean
}

/**
 * Конфигурация поведения таблицы (замена boolean-пропсов при мажорном релизе)
 */
export interface TableBehaviorConfig {
	/** Выделяемые строки */
	selectable?: boolean
	/** Множественная сортировка */
	multiSort?: boolean
	/** Ресайз колонок */
	resizable?: boolean
}

/**
 * Пропсы компонента BaseTable
 */
export interface BaseTableProps extends BaseComponentProps<TableVariant> {
	/** Колонки */
	columns: TableColumn[]
	/** Строки */
	rows: TableRow[]
	/** Загрузка */
	isLoading?: boolean
	/** Пустое сообщение */
	emptyText?: string
	/** Высота таблицы (для фиксированного заголовка) */
	height?: string
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

	/** Конфигурация функций таблицы (заменяет boolean-пропсы) */
	features?: TableFeaturesConfig
	/** Конфигурация поведения таблицы (заменяет boolean-пропсы) */
	behavior?: TableBehaviorConfig
	/**
	 * Внутренние отступы ячеек. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию 10 → 10px 20px
	 */
	padding?: PaddingProp
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
 * Колбэки Transition для раскрытия/сворачивания строк (provide/inject)
 */
export interface TableExpandTransitionCallbacks {
	onExpandBeforeEnter: (el: Element) => void
	onExpandEnter: (el: Element, done: () => void) => void
	onExpandAfterEnter: (el: Element) => void
	onCollapseBeforeLeave: (el: Element) => void
	onCollapseLeave: (el: Element, done: () => void) => void
	onCollapseAfterLeave: (el: Element) => void
}

/** Ключ provide/inject для transition-колбэков раскрытия строк */
export const TABLE_EXPAND_TRANSITION_KEY = Symbol('TABLE_EXPAND_TRANSITION') as InjectionKey<TableExpandTransitionCallbacks>

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
		visiblePages: VisiblePageItem[]
		pageSize: number
		pageSizeOptions: number[]
		paginationInfo: string
		pageSizeSelectOptions: Array<{ value: string; label: string }>
		handlePageSizeChange: (value: string | number) => void
	}) => unknown
	[key: `header-${string}`]: (props: { column: TableColumn }) => unknown
	[key: `cell-${string}`]: (props: { column: TableColumn; row: TableRow }) => unknown
}

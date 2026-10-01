import type { InjectionKey } from 'vue'
import type { PaddingProp } from '@composables/base/usePadding'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'

export const TABLE_VARIANTS = ['default', 'bordered', 'striped'] as const

export type SortDirection = 'asc' | 'desc' | null

export type SortType = 'string' | 'number' | 'date'

export type FilterOperator = 'eq' | 'ne' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in'

export type ColumnFilterType = 'text' | 'select' | 'range' | 'date' | 'multi-select'

export interface FilterOption {
	/** Значение */
	value: string
	/** Метка */
	label: string
}

export interface ColumnFilterConfig {
	/** Тип фильтра */
	type: ColumnFilterType
	/** Опции (для select/multi-select) */
	options?: FilterOption[]
	/** Плейсхолдер */
	placeholder?: string
}

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

export interface SortState {
	/** Ключ колонки */
	key: string
	/** Направление */
	direction: SortDirection
}

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

export interface NestedTableConfig {
	/** Колонки вложенной таблицы */
	columns: TableColumn[]
	/** Ключ данных для дочерних строк */
	childrenKey: string
	/** Заголовок вложенной таблицы */
	title?: string
}

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

export type TableVariant = (typeof TABLE_VARIANTS)[number]

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

export interface BaseTableProps extends BaseComponentProps<
	TableVariant,
	| 'root'
	| 'body'
	| 'header'
	| 'toolbar'
	| 'search'
	| 'filters'
	| 'settings'
	| 'activeFilters'
	| 'wrapper'
	| 'loadingOverlay'
	| 'table'
	| 'thead'
	| 'tr'
	| 'th'
	| 'tbody'
	| 'td'
	| 'loadMore'
	| 'footerBar'
	| 'pageSize'
	| 'paginationInfo'
	| 'footer'
> {
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
	 * Внутренние отступы ячеек и заголовков. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию — из стилей: 12px сверху/снизу, 16px по бокам (строка 44px при sizeScale = 100).
	 */
	padding?: PaddingProp
	/**
	 * Виртуальная прокрутка: в DOM только видимые строки и запас, остальные — высотой распорок. Работает вместе с `height`
	 * (область прокрутки таблицы). Для тысяч строк без пагинации
	 */
	isVirtual?: boolean
	/** Высота строки до замера при `isVirtual`, px: строки замеряются после отрисовки, раскрытые строки учитываются */
	rowHeight?: number
}

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

export const TABLE_EXPAND_TRANSITION_KEY = Symbol('TABLE_EXPAND_TRANSITION') as InjectionKey<TableExpandTransitionCallbacks>

export interface BaseTableSlots {
	/** Над таблицей и панелью инструментов: заголовок, описание, свои кнопки */
	header?: () => unknown
	/** Под таблицей и пагинацией */
	footer?: () => unknown
	/** Строка «нет данных» вместо `emptyText`, когда строк нет или фильтр ничего не нашёл */
	empty?: () => unknown
	/** Начало панели инструментов — перед поиском и фильтрами */
	'toolbar-prepend'?: () => unknown
	/** Конец панели инструментов — после поиска, фильтров и настроек колонок */
	'toolbar-append'?: () => unknown
	/** Содержимое раскрытой строки при `features.isExpandable`: `row` — её данные */
	'expanded-content'?: (props: { row: TableRow }) => unknown
	/**
	 * Пагинация вместо подписи с диапазоном строк и BasePagination: номер и число страниц, видимые номера, размер страницы
	 * и `handlePageSizeChange` для своего выбора размера
	 */
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
	/**
	 * Заголовок одной колонки по её `key`: `header-status` — колонка `status`. Имя можно собрать в шаблоне:
	 * ``#[`header-${key}`]`` в `v-for`
	 */
	[key: `header-${string}`]: (props: {
		/** Колонка из `columns` */
		column: TableColumn
	}) => unknown
	/**
	 * Ячейки одной колонки по её `key`: `cell-status` — колонка `status`. Одинаковые ячейки нескольких колонок —
	 * ``<template v-for="key in keys" :key="key" #[`cell-${key}`]="{ value }">``
	 */
	[key: `cell-${string}`]: (props: {
		/** Значение ячейки — `row.data[column.key]` */
		value: unknown
		/** Строка целиком */
		row: TableRow
		/** Колонка из `columns` */
		column: TableColumn
		/** Номер строки на странице; у вложенных строк его нет */
		index?: number
	}) => unknown
}

export type TableProps = PropsWithDefaults<
	BaseTableProps,
	'isLoading' | 'height' | 'pageSize' | 'pageSizeOptions' | 'loadMode' | 'searchDebounce' | 'isVirtual' | 'rowHeight'
>

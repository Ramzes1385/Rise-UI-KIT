import type { InjectionKey, Ref, Slots } from 'vue'
import type { PaddingProp } from '@composables/base/usePadding'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'
import type { TableExportFormat, TableExportOptions } from '@utils/data/tableExportUtils/types/tableExportUtils.types'

export const TABLE_VARIANTS = ['default', 'bordered', 'striped'] as const

/**
 * Части таблицы для пропа `ui` (БЭМ-элементы `.base-table__<часть>`, `root` — корень):
 * body — рамка со всем содержимым; header — слот `header` над таблицей; toolbar — панель инструментов; search — поиск;
 * filters — фильтры; settings — меню видимости колонок; export — меню выгрузки; active-filters — метки активных фильтров;
 * content — область таблицы с подложкой загрузки; wrapper — прокручиваемая обёртка `<table>`; loading-overlay — подложка
 * со спиннером при перезагрузке; table — `<table>`; thead — шапка; th — ячейка шапки; sort-btn — кнопка сортировки в шапке;
 * resizer — ручка ширины колонки; tbody — тело; tr — строка данных (и дочерние, раскрытые, вложенные строки; не скелетон
 * и не строка «нет данных»); td — ячейка; expand-btn — кнопка раскрытия строки; expanded-wrapper — содержимое раскрытой
 * строки; nested-wrapper — вложенная таблица; load-more — кнопка «Загрузить ещё»; footer-bar — полоса пагинации;
 * page-size — выбор размера страницы; pagination-info — подпись с диапазоном строк; footer — слот `footer`.
 */
export const TABLE_PARTS = [
	'body',
	'header',
	'toolbar',
	'search',
	'filters',
	'settings',
	'export',
	'active-filters',
	'content',
	'wrapper',
	'loading-overlay',
	'table',
	'thead',
	'th',
	'sort-btn',
	'resizer',
	'tbody',
	'tr',
	'td',
	'expand-btn',
	'expanded-wrapper',
	'nested-wrapper',
	'load-more',
	'footer-bar',
	'page-size',
	'pagination-info',
	'footer',
] as const

export type BaseTablePart = (typeof TABLE_PARTS)[number]

export type SortDirection = 'asc' | 'desc' | null

export type SortType = 'string' | 'number' | 'date'

/**
 * Оператор фильтра. Тулбар предлагает операторы по типу колонки (`filterConfig.type`, иначе `sortType`): текст — `contains`,
 * `eq`, `ne`; число — `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `between`; дата — те же, но даты сравниваются по дням;
 * `select` — `eq`, `ne`; `multi-select` — `in`
 */
export type FilterOperator = 'eq' | 'ne' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in'

/**
 * Тип поля фильтра колонки: `text` — строка, `select` — одно значение из `options`, `multi-select` — несколько значений
 * из `options` (оператор `in`), `date` — дата (выбор в календаре, сравнение по дням), `range` — диапазон «от — до»
 * (оператор `between` по числам или, при `sortType: 'date'`, по датам)
 */
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
	/**
	 * Значение для сортировки вместо `row.data[key]`, к которому применяется `sortType`: например, ISO-дата для колонки
	 * с датами «ДД.ММ.ГГГГ», число из объекта или вложенное поле. Поиск и фильтры читают `row.data[key]`
	 */
	sortAccessor?: (row: TableRow) => unknown
	/** Сортируемая */
	isSortable?: boolean
	/** Фильтруемая */
	isFilterable?: boolean
	/** Настройки фильтра в тулбаре: тип поля, варианты выбора, подсказка. Без них тип выводится из `sortType` */
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
	/**
	 * Значение колонки в выгрузке (`features.export`, `exportData`) вместо `formatter`: число или `Date` сохраняют тип
	 * в Excel. Без него выгружается текст `formatter`, а без `formatter` — значение из `row.data`
	 */
	exportValue?: (value: unknown, row: TableRow) => unknown
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
	/** Значение; для `in` — выбранные значения через запятую (для показа), сами значения в `values` */
	value: string
	/** Верхняя граница для `between`: диапазон включает обе границы */
	valueTo?: string
	/** Выбранные значения для `in`: строка проходит, если её значение равно одному из них */
	values?: string[]
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
	/**
	 * Кнопка «Экспорт» в панели инструментов: `true` — CSV и Excel, массив — только названные форматы
	 * (`['xlsx']`). Выгружаются строки после поиска, фильтров и сортировки со всех страниц и видимые колонки
	 * по порядку; если выбраны строки — только выбранные
	 */
	export?: boolean | TableExportFormat[]
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
	| 'export'
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
	/** Пустое сообщение: строк нет */
	emptyText?: string
	/** Пустое сообщение, когда строки есть, но поиск или фильтры скрыли все: по умолчанию «Ничего не найдено» */
	emptyFilteredText?: string
	/** Высота таблицы (для фиксированного заголовка) */
	height?: string
	/**
	 * Размер страницы (`v-model:pageSize`): число строк на странице, `0` — без пагинации. Выбор размера в футере и
	 * `pageSize` из пропса возвращают на первую страницу; новый размер приходит в `update:pageSize` и `page-size-change`
	 */
	pageSize?: number
	/**
	 * Номер текущей страницы с 1 (`v-model:page`). Заданный проп переходит на управление снаружи: клик по пагинации,
	 * сброс страницы поиском или фильтром и сдвиг на последнюю существующую страницу только сообщают номер в
	 * `update:page` (и `page-change`), страницей остаётся значение пропса. Без пропса страница внутренняя
	 */
	page?: number
	/**
	 * Всего строк на сервере (серверная пагинация): `rows` — только текущая страница, а число страниц, подпись
	 * «1–10 из 100» и пагинация считаются по `totalRows`. В режиме `pagination` строки не нарезаются по `pageSize`; в
	 * `button` и `infinite` подгрузка продолжается, пока в `rows` меньше `totalRows`. Поиск, фильтры и сортировка
	 * по-прежнему применяются к переданным строкам: для серверных передайте на сервер события `search`, `filter`, `sort`
	 */
	totalRows?: number
	/**
	 * Выбранные строки (`v-model:selectedIds`): массив `id`. Заданный проп переходит на управление снаружи — `isSelected`
	 * строк не учитывается, клик по чекбоксам и «Выбрать все» только сообщают новый набор в `update:selectedIds` (и
	 * `select`), а id строк, которых нет в `rows` (другая страница серверной пагинации), сохраняются. Без пропса выбор
	 * внутренний: стартует с `isSelected` строк. Снять весь выбор — `clearSelection()` через `ref`
	 */
	selectedIds?: Array<string | number>
	/** Варианты размера страницы для селектора */
	pageSizeOptions?: number[]
	/** Режим подгрузки */
	loadMode?: LoadMode
	/**
	 * Есть строки, которые родитель ещё не передал (серверная подгрузка): в режимах `button` и `infinite` кнопка
	 * «Загрузить ещё» и подгрузка прокруткой работают и после показа всех переданных строк. Родитель дописывает
	 * строки в `rows` по `load-more` и снимает флаг, когда данных больше нет
	 */
	hasMore?: boolean
	/** Дебаунс поиска (мс) */
	searchDebounce?: number
	/**
	 * Язык сравнения строк при сортировке (BCP 47: `'ru'`, `'de'`, `'sv'`). Без него — язык кита (`defineLocale`).
	 * Числа внутри строк сравниваются как числа («Item 2» перед «Item 10»), пустые значения всегда в конце
	 */
	sortLocale?: string
	/** Конфиг вложенной таблицы */
	nestedConfig?: NestedTableConfig
	/**
	 * Раскрытые строки (`v-model:expandedIds`): массив `id` строк. Заданный проп переходит на управление снаружи — `isExpanded`
	 * строк не учитывается, а клик по строке или кнопке только сообщает новый набор в `update:expandedIds`. Без пропса
	 * набор внутренний: строка с `isExpanded: true` раскрывается, с `false` сворачивается (учитывается изменение флага)
	 */
	expandedIds?: Array<string | number>
	/**
	 * Строки активируются с клавиатуры: одна точка Tab, ↑/↓, Home и End между строками, Enter и пробел дают `row-click`.
	 * Без пропса режим включается, пока на таблице есть слушатель `@row-click` (добавленный или снятый позже слушатель
	 * учитывается при следующей отрисовке); `false` — строки не фокусируются, даже если слушатель есть
	 */
	isRowInteractive?: boolean

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
	/**
	 * Настройки выгрузки по кнопке «Экспорт» и `exportData()`: `fileName` — имя файла без расширения (по умолчанию
	 * `table`), `sheetName` — имя листа Excel, `delimiter`, `locale`, `hasBom`, `isFormulaSafe` — CSV
	 */
	exportOptions?: TableExportOptions
	/**
	 * Классы частей таблицы (`root`, `th`, `tr`, `td`, `toolbar`…) — добавляются к классам кита. Глобально —
	 * `createUiKitPlugin({ defaults: { BaseTable: { ui } } })`, классы плагина и экземпляра склеиваются. Вложенная
	 * таблица (`nestedConfig`) получает только глобальные классы.
	 *
	 * @example
	 * <BaseTable :columns="columns" :rows="rows" :ui="{ th: 'uppercase', td: 'tabular-nums' }" />
	 */
	ui?: UiProp<BaseTablePart>
}

/**
 * Событие `export` перед скачиванием: формат, строки и колонки выгрузки. `preventDefault()` отменяет скачивание —
 * например, чтобы выгрузить данные на сервере
 */
export interface TableExportEvent {
	/** Формат: `csv` или `xlsx` */
	format: TableExportFormat
	/** Строки выгрузки по порядку */
	rows: TableRow[]
	/** Колонки выгрузки по порядку */
	columns: TableColumn[]
	/** Отменить скачивание файла */
	preventDefault: () => void
}

/**
 * Настройки `exportData()`: `onlySelected` — только выбранные строки (по умолчанию — выбранные, если они есть),
 * `visibleColumnsOnly` — без скрытых колонок (по умолчанию `true`); остальное — как `exportOptions` и важнее их
 */
export interface TableExportDataOptions extends TableExportOptions {
	/** Только выбранные строки: по умолчанию — выбранные, если они есть, иначе все */
	onlySelected?: boolean
	/** Только видимые колонки: по умолчанию `true` */
	visibleColumnsOnly?: boolean
}

/** Источник выгрузки BaseTable: строки после поиска, фильтров и сортировки, колонки и выбор */
export interface TableExportSource {
	processedRows: Readonly<Ref<TableRow[]>>
	localColumns: Readonly<Ref<TableColumn[]>>
	visibleColumns: Readonly<Ref<TableColumn[]>>
	isSelected: (row: TableRow) => boolean
}

/** Методы BaseTable через `ref` */
export interface BaseTableExpose {
	/**
	 * Выгружает таблицу файлом CSV или Excel: строки после поиска, фильтров и сортировки со всех страниц.
	 * Возвращает `false`, если обработчик `export` отменил скачивание
	 */
	exportData: (format: TableExportFormat, options?: TableExportDataOptions) => boolean
	/**
	 * Снимает выбор со всех строк, в том числе отключённых и не попавших в `rows`; сообщает пустой набор в
	 * `update:selectedIds` и `select`. Ничего не делает, если выбора нет. Для `v-model:selectedIds` достаточно
	 * присвоить пустой массив, метод нужен при внутреннем выборе
	 */
	clearSelection: () => void
}

export interface BaseTableEmits {
	(event: 'sort', state: SortState[]): void
	(event: 'filter', filters: ColumnFilter[]): void
	(event: 'search', query: string): void
	(event: 'select', rows: TableRow[]): void
	(event: 'expand', row: TableRow): void
	(event: 'update:expandedIds', ids: Array<string | number>): void
	(event: 'page-change', page: number): void
	(event: 'update:page', page: number): void
	(event: 'page-size-change', size: number): void
	(event: 'update:pageSize', size: number): void
	(event: 'update:selectedIds', ids: Array<string | number>): void
	(event: 'load-more'): void
	(event: 'row-click', row: TableRow): void
	(event: 'column-resize', key: string, width: number): void
	(event: 'columns-change', columns: TableColumn[]): void
	(event: 'export', payload: TableExportEvent): void
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

/** Слоты `cell-*` и `header-*` приложения для строк и заголовка таблицы (provide/inject) */
export const TABLE_SLOTS_KEY = Symbol('TABLE_SLOTS') as InjectionKey<Slots>

/** Классы частей из пропа `ui` и `defaults.BaseTable.ui` плагина — для частей таблицы (provide/inject) */
export const TABLE_UI_KEY = Symbol('TABLE_UI') as InjectionKey<UiClassFn<BaseTablePart>>

export interface BaseTableSlots {
	/** Над таблицей и панелью инструментов: заголовок, описание, свои кнопки */
	header?: () => unknown
	/** Под таблицей и пагинацией */
	footer?: () => unknown
	/**
	 * Строка «нет данных» вместо `emptyText`, когда строк нет или фильтр ничего не нашёл: `isFiltered` — строки есть,
	 * но поиск или фильтры скрыли все
	 */
	empty?: (props: { isFiltered: boolean }) => unknown
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
	 * Подпись заголовка одной колонки по её `key`. У сортируемой колонки слот рисуется внутри кнопки сортировки
	 * (её значок и приоритет остаются), поэтому в нём не должно быть своих кнопок и ссылок: `header-status` — колонка `status`. Имя можно собрать в шаблоне:
	 * ``#[`header-${key}`]`` в `v-for`
	 */
	[key: `header-${string}`]: (props: {
		/** Колонка из `columns` */
		column: TableColumn
		/** Направление сортировки колонки: `asc`, `desc` или `null` */
		sortDirection: SortDirection
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
	'isLoading' | 'hasMore' | 'height' | 'pageSize' | 'pageSizeOptions' | 'loadMode' | 'searchDebounce' | 'isVirtual' | 'rowHeight'
>

/** Смещения закреплённых колонок, px: служебные колонки по типу, колонки слева и справа по `key` */
export interface StickyOffsets {
	service: Record<string, number>
	left: Record<string, number>
	right: Record<string, number>
}

/** Параметры расчёта смещений закреплённых колонок */
export interface TableStickyOptions {
	/** Обёртка таблицы: в ней ищутся ячейки заголовка */
	wrapperRef: Ref<HTMLElement | null>
	/** Видимые колонки по порядку */
	visibleColumns: Ref<TableColumn[]>
	/** Служебные колонки слева по порядку: `check`, `number`, `expand` */
	serviceKeys: Ref<string[]>
}

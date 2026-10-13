import type { ComputedRef, Ref } from 'vue'
import type { UseTableFilterReturn } from '@composables/table/useTableFilter'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'
import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableDataOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Размер страницы */
	pageSize: Ref<number>
	/** Есть ли строки, которые родитель ещё не передал (серверная подгрузка в режимах button и infinite) */
	hasMore?: () => boolean
	/** Множественная сортировка */
	isMultiSort: () => boolean
	/** Дебаунс поиска (мс) */
	searchDebounce: () => number
	/** Язык сравнения строк при сортировке (BCP 47); без него — язык кита */
	sortLocale?: () => string | undefined
	/** Callback при поиске */
	onSearch?: (query: string) => void
	/** Callback при сортировке */
	onSort?: (states: SortState[]) => void
	/** Callback при фильтрации */
	onFilter?: (filters: ColumnFilter[]) => void
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
	/** Страница снаружи (`v-model:page`); `undefined` — страница внутренняя */
	page?: () => number | undefined
	/** Callback при смене страницы */
	onPageChange?: (page: number) => void
	/** Всего строк на сервере (серверная пагинация): `rows` — только текущая страница */
	totalRows?: () => number | undefined
}

export interface UseTableDataReturn {
	/** Поисковый запрос */
	searchQuery: Ref<string>
	/** Состояния сортировки */
	sortStates: Ref<SortState[]>
	/** Активные фильтры */
	activeFilters: Ref<ColumnFilter[]>
	/** Текущая страница */
	currentPage: Ref<number>
	/** Локальный размер страницы */
	localPageSize: Ref<number>
	/** Обработанные строки */
	processedRows: ComputedRef<TableRow[]>
	/** Отображаемые строки */
	displayedRows: ComputedRef<TableRow[]>
	/** Всего строк: `totalRows` с сервера или число обработанных строк */
	totalCount: Ref<number>
	/** Общее количество страниц */
	totalPages: Ref<number>
	/** Видимые номера страниц */
	visiblePages: Ref<VisiblePageItem[]>
	/** Есть ли ещё данные для подгрузки */
	hasMoreRows: Ref<boolean>
	/** Получить направление сортировки */
	getSortDirection: (key: string) => 'asc' | 'desc' | null
	/** Получить индекс сортировки */
	getSortIndex: (key: string) => number
	/** Обработчик сортировки */
	handleSort: (column: TableColumn) => void
	/** Обработчик ввода поиска */
	handleSearchInput: (value: string) => void
	/** Добавить фильтр */
	addFilter: UseTableFilterReturn['addFilter']
	/** Удалить фильтр */
	removeFilter: (index: number) => void
	/** Получить метку фильтра */
	getFilterLabel: (filter: ColumnFilter) => string
	/** Обработчик изменения размера страницы */
	handlePageSizeChange: (value: string | number | (string | number)[]) => void
	/** Подгрузить ещё */
	loadMore: () => void
	/** Сбросить страницу */
	resetPage: () => void
}

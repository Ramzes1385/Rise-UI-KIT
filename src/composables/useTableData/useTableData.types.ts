import type { ComputedRef, Ref } from 'vue'

import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { VisiblePageItem } from '@utils/paginationUtils/paginationUtils.types'

/**
 * Опции composable useTableData
 */
export interface UseTableDataOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Размер страницы */
	pageSize: Ref<number>
	/** Множественная сортировка */
	isMultiSort: () => boolean
	/** Дебаунс поиска (мс) */
	searchDebounce: () => number
	/** Callback при поиске */
	onSearch?: (query: string) => void
	/** Callback при сортировке */
	onSort?: (states: SortState[]) => void
	/** Callback при фильтрации */
	onFilter?: (filters: ColumnFilter[]) => void
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
}

/**
 * Результат composable useTableData
 */
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
	addFilter: (
		filterColumn: Ref<string | number>,
		filterOperator: Ref<string | number>,
		filterValue: Ref<string>,
	) => void
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

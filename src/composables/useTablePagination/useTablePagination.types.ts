import type { TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { VisiblePageItem } from '@utils/paginationUtils/paginationUtils.types'
import type { ComputedRef, Ref } from 'vue'

/**
 * Опции composable useTablePagination
 */
export interface UseTablePaginationOptions {
	/** Обработанные строки (поиск + фильтры + сортировка) */
	processedRows: Ref<TableRow[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Размер страницы */
	pageSize: Ref<number>
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
}

/**
 * Результат composable useTablePagination
 */
export interface UseTablePaginationReturn {
	/** Текущая страница */
	currentPage: Ref<number>
	/** Локальный размер страницы */
	localPageSize: Ref<number>
	/** Отображаемые строки */
	displayedRows: ComputedRef<TableRow[]>
	/** Общее количество страниц */
	totalPages: ComputedRef<number>
	/** Видимые номера страниц */
	visiblePages: ComputedRef<VisiblePageItem[]>
	/** Есть ли ещё данные для подгрузки */
	hasMoreRows: ComputedRef<boolean>
	/** Подгрузить ещё данные */
	loadMore: () => void
	/** Сброс страницы/счётчика */
	resetPage: () => void
	/** Обработчик изменения размера страницы */
	handlePageSizeChange: (value: string | number | (string | number)[]) => void
}

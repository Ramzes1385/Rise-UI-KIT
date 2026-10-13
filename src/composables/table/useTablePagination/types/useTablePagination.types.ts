import type { ComputedRef, Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'

export interface UseTablePaginationOptions {
	/** Обработанные строки (поиск + фильтры + сортировка) */
	processedRows: Ref<TableRow[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Размер страницы */
	pageSize: Ref<number>
	/** Есть ли строки, которые родитель ещё не передал: «Загрузить ещё» и infinite работают и после показа всех строк */
	hasMore?: () => boolean
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
	/** Страница снаружи (`v-model:page`): при заданном значении номер страницы управляется родителем; `undefined` — внутренний */
	page?: () => number | undefined
	/** Callback при смене страницы: пользователем, сбросом поиска или фильтра, сдвигом на последнюю существующую */
	onPageChange?: (page: number) => void
	/** Всего строк на сервере: страница `processedRows` — вся текущая страница, число страниц и подпись считаются по нему */
	totalRows?: () => number | undefined
}

export interface UseTablePaginationReturn {
	/** Текущая страница */
	currentPage: Ref<number>
	/** Локальный размер страницы */
	localPageSize: Ref<number>
	/** Отображаемые строки */
	displayedRows: ComputedRef<TableRow[]>
	/** Всего строк: `totalRows` с сервера или число обработанных строк */
	totalCount: ComputedRef<number>
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

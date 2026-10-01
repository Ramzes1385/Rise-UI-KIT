import type { ComputedRef, Ref } from 'vue'

export interface TablePaginationActionsState {
	/** Режим подгрузки */
	loadMode: () => string
	/** Текущая страница */
	currentPage: Ref<number>
	/** Локальный размер страницы */
	localPageSize: Ref<number>
	/** Размер страницы с учётом значения по умолчанию */
	effectivePageSize: ComputedRef<number>
	/** Количество загруженных строк для button/infinite режимов */
	loadedCount: Ref<number>
	/** Callback при изменении размера страницы */
	onPageSizeChange?: (size: number) => void
}

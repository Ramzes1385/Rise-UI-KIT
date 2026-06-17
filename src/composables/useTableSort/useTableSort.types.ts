import type { SortState, TableColumn } from '@components/BaseTable/model/BaseTable.types'
import type { Ref } from 'vue'

/**
 * Опции composable useTableSort
 */
export interface UseTableSortOptions {
	/** Множественная сортировка */
	isMultiSort: () => boolean
	/** Callback при сортировке */
	onSort?: (states: SortState[]) => void
}

/**
 * Результат composable useTableSort
 */
export interface UseTableSortReturn {
	/** Текущие состояния сортировки */
	sortStates: Ref<SortState[]>
	/** Получить направление сортировки для колонки */
	getSortDirection: (key: string) => 'asc' | 'desc' | null
	/** Получить индекс сортировки (для мульти-сортировки) */
	getSortIndex: (key: string) => number
	/** Обработка клика по заголовку колонки */
	handleSort: (column: TableColumn) => void
}

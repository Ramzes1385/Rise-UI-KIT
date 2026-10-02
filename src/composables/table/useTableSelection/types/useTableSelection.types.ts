import type { ComputedRef, Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableSelectionOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/**
	 * Строки, прошедшие поиск и фильтры (все страницы) — область действия «Выбрать все».
	 * По умолчанию совпадает с rows.
	 */
	filteredRows?: Ref<TableRow[]>
	/** Callback при изменении выбора */
	onSelect?: (rows: TableRow[]) => void
}

export interface UseTableSelectionReturn {
	/** ID выбранных строк */
	selectedIds: Ref<Set<string | number>>
	/** Выбранные строки */
	selectedRows: ComputedRef<TableRow[]>
	/** Все ли доступные строки отфильтрованного набора выбраны */
	isAllSelected: ComputedRef<boolean>
	/** Выбрана часть доступных строк отфильтрованного набора (частичное состояние «Выбрать все») */
	isSomeSelected: ComputedRef<boolean>
	/** Доступных строк в отфильтрованном наборе нет: «Выбрать все» неактивен */
	isSelectAllDisabled: ComputedRef<boolean>
	/** Проверить, выбрана ли строка */
	isSelected: (row: TableRow) => boolean
	/** Переключить выбор строки */
	toggleRow: (row: TableRow) => void
	/** Выбрать/снять выбор со всех строк отфильтрованного набора */
	toggleAll: () => void
}

export interface SelectionSyncState {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** ID выбранных строк */
	selectedIds: Ref<Set<string | number>>
	/** Выбор потерял строки, которых больше нет в rows */
	onSelectionLost: () => void
}

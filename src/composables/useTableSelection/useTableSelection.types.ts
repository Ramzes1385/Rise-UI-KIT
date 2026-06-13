import type { ComputedRef, Ref } from 'vue'

import type { TableRow } from '@components/BaseTable/model/BaseTable.types'

/**
 * Опции composable useTableSelection
 */
export interface UseTableSelectionOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Callback при изменении выбора */
	onSelect?: (rows: TableRow[]) => void
}

/**
 * Результат composable useTableSelection
 */
export interface UseTableSelectionReturn {
	/** ID выбранных строк */
	selectedIds: Ref<Set<string | number>>
	/** Выбранные строки */
	selectedRows: ComputedRef<TableRow[]>
	/** Все ли доступные строки выбраны */
	isAllSelected: ComputedRef<boolean>
	/** Проверить, выбрана ли строка */
	isSelected: (row: TableRow) => boolean
	/** Переключить выбор строки */
	toggleRow: (row: TableRow) => void
	/** Выбрать/снять выбор со всех строк */
	toggleAll: () => void
}

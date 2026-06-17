import { computed, ref, watch } from 'vue'
import type { UseTableSelectionOptions, UseTableSelectionReturn } from './useTableSelection.types'
import type { TableRow } from '@components/BaseTable/model/BaseTable.types'

/**
 * Composable для управления выбором строк таблицы.
 */
function useTableSelection(options: UseTableSelectionOptions): UseTableSelectionReturn {
	const { rows, onSelect } = options

	const selectedIds = ref<Set<string | number>>(new Set())

	/** Синхронизация выбранных ID с isSelected в строках (read-only) */
	function syncFromRows(): void {
		const next = new Set<string | number>()
		for (const row of rows.value) {
			if (row.isSelected) next.add(row.id)
		}
		selectedIds.value = next
	}

	watch(() => rows.value, syncFromRows, { immediate: true })

	/** Выбрана ли строка */
	function isSelected(row: TableRow): boolean {
		return selectedIds.value.has(row.id)
	}

	/** Выбранные строки */
	const selectedRows = computed((): TableRow[] => {
		return rows.value.filter(row => selectedIds.value.has(row.id))
	})

	/** Все ли selectable строки выбраны */
	const isAllSelected = computed((): boolean => {
		const selectable = rows.value.filter(r => !r.isDisabled)
		return selectable.length > 0 && selectable.every(r => selectedIds.value.has(r.id))
	})

	/** Переключить выбор строки */
	function toggleRow(row: TableRow): void {
		const next = new Set(selectedIds.value)
		if (next.has(row.id)) {
			next.delete(row.id)
		} else {
			next.add(row.id)
		}
		selectedIds.value = next
		if (onSelect) onSelect(selectedRows.value)
	}

	/** Выбрать/снять выбор со всех строк */
	function toggleAll(): void {
		const shouldSelect = !isAllSelected.value
		const next = new Set<string | number>()
		if (shouldSelect) {
			for (const row of rows.value) {
				if (!row.isDisabled) next.add(row.id)
			}
		}
		selectedIds.value = next
		if (onSelect) onSelect(selectedRows.value)
	}

	return {
		selectedIds,
		selectedRows,
		isAllSelected,
		isSelected,
		toggleRow,
		toggleAll,
	}
}

export { useTableSelection }

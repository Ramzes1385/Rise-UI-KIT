/** Composable: управление выбором строк таблицы */
import { computed, ref, watch } from 'vue'
import type { TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { UseTableSelectionOptions, UseTableSelectionReturn } from './useTableSelection.types'

/**
 * Composable для управления выбором строк таблицы.
 */
function useTableSelection(options: UseTableSelectionOptions): UseTableSelectionReturn {
	const { rows, filteredRows = rows, onSelect } = options

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

	/** Строки, на которые действует «Выбрать все»: прошедшие поиск и фильтры (на всех страницах), кроме disabled */
	const selectableFilteredRows = computed((): TableRow[] => {
		return filteredRows.value.filter(row => !row.isDisabled)
	})

	/** Все ли доступные строки отфильтрованного набора выбраны */
	const isAllSelected = computed((): boolean => {
		const selectable = selectableFilteredRows.value
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

	/**
	 * Выбрать/снять выбор со всех строк отфильтрованного набора.
	 * Результат в обе стороны — подмножество отфильтрованных строк: ранее выбранные, но скрытые поиском
	 * строки снимаются, иначе массовое действие по payload `select` затронуло бы невидимые данные.
	 * Выбор disabled-строк не меняется: пользователь не может изменить его и чекбоксом строки.
	 */
	function toggleAll(): void {
		const selectable = selectableFilteredRows.value
		if (!selectable.length) return

		const shouldSelect = !isAllSelected.value
		const next = new Set<string | number>()
		for (const row of rows.value) {
			if (row.isDisabled && selectedIds.value.has(row.id)) next.add(row.id)
		}
		if (shouldSelect) {
			for (const row of selectable) next.add(row.id)
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

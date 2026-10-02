/** Composable: управление выбором строк таблицы */
import { computed, ref, watch } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { SelectionSyncState, UseTableSelectionOptions, UseTableSelectionReturn } from './types/useTableSelection.types'
import {
	collectDisabledSelectedIds,
	collectRowFlags,
	collectSelectedIds,
	mergeSelectedIds,
	toggleSelectedId,
} from './useTableSelectionUtils'

/** Смена rows не сбрасывает выбор: выпадают только исчезнувшие строки, о потере выбора сообщает onSelectionLost */
function syncSelectionWithRows(state: SelectionSyncState): void {
	const { rows, selectedIds, onSelectionLost } = state
	let rowFlags = collectRowFlags(rows.value)
	watch(
		() => [rows.value, rows.value.length],
		() => {
			const nextFlags = collectRowFlags(rows.value)
			const next = mergeSelectedIds({ selectedIds: selectedIds.value, previousFlags: rowFlags, nextFlags })
			const hasLostSelection = [...selectedIds.value].some(id => !nextFlags.has(id))
			rowFlags = nextFlags
			selectedIds.value = next
			if (hasLostSelection) onSelectionLost()
		},
	)
}

function useTableSelection(options: UseTableSelectionOptions): UseTableSelectionReturn {
	const { rows, filteredRows = rows, onSelect } = options

	const selectedIds = ref<Set<string | number>>(collectSelectedIds(rows.value))
	syncSelectionWithRows({ rows, selectedIds, onSelectionLost: () => onSelect?.(selectedRows.value) })

	function isSelected(row: TableRow): boolean {
		return selectedIds.value.has(row.id)
	}

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

	/** Выбрана часть доступных строк отфильтрованного набора — «Выбрать все» в частичном состоянии */
	const isSomeSelected = computed((): boolean => {
		return !isAllSelected.value && selectableFilteredRows.value.some(r => selectedIds.value.has(r.id))
	})

	function toggleRow(row: TableRow): void {
		selectedIds.value = toggleSelectedId(selectedIds.value, row.id)
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
		const next = collectDisabledSelectedIds(rows.value, selectedIds.value)
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
		isSomeSelected,
		isSelected,
		toggleRow,
		toggleAll,
	}
}

export { useTableSelection }

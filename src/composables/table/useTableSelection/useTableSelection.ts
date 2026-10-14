/** Composable: управление выбором строк таблицы */
import { watch } from 'vue'
import { useTableSelectedIds } from './useTableSelectedIds'
import { useTableSelectAllState } from './useTableSelectAllState'
import { useTableHiddenSelection } from './useTableHiddenSelection'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import { collectDisabledSelectedIds, collectRowFlags, mergeSelectedIds, toggleSelectedId } from './useTableSelectionUtils'
import type { SelectionSyncState, UseTableSelectionOptions, UseTableSelectionReturn } from './types/useTableSelection.types'

/** Смена rows не сбрасывает выбор: выпадают только исчезнувшие строки, о потере выбора сообщает onSelectionLost */
function syncSelectionWithRows(state: SelectionSyncState): void {
	const { rows, selectedIds, isControlled, onSelectionLost } = state
	let rowFlags = collectRowFlags(rows.value)
	watch(
		() => [rows.value, rows.value.length],
		() => {
			const nextFlags = collectRowFlags(rows.value)
			if (isControlled()) {
				rowFlags = nextFlags
				return
			}
			const next = mergeSelectedIds({ selectedIds: selectedIds.value, previousFlags: rowFlags, nextFlags })
			const hasLostSelection = [...selectedIds.value].some(id => !nextFlags.has(id))
			rowFlags = nextFlags
			selectedIds.value = next
			if (hasLostSelection) onSelectionLost()
		},
	)
}

function useTableSelection(options: UseTableSelectionOptions): UseTableSelectionReturn {
	const { rows, filteredRows = rows, visibleRows = rows, onSelect, onSelectedIdsChange, isKeepingOutOfScope = () => false } = options
	const { isControlled, internalIds, selectedIds, selectedRows } = useTableSelectedIds(options)

	function applySelection(next: Set<string | number>): void {
		if (!isControlled()) internalIds.value = next
		onSelectedIdsChange?.([...next])
		onSelect?.(rows.value.filter(row => next.has(row.id)))
	}

	syncSelectionWithRows({
		rows,
		selectedIds: internalIds,
		isControlled,
		onSelectionLost: () => applySelection(internalIds.value),
	})

	function isSelected(row: TableRow): boolean {
		return selectedIds.value.has(row.id)
	}

	const { selectableFilteredRows, isAllSelected, isSomeSelected, isSelectAllDisabled } = useTableSelectAllState(filteredRows, selectedIds)

	const hiddenSelectedCount = useTableHiddenSelection(rows, visibleRows, selectedIds)

	function toggleRow(row: TableRow): void {
		applySelection(toggleSelectedId(selectedIds.value, row.id))
	}

	/**
	 * Выбрать/снять выбор со всех строк отфильтрованного набора.
	 * Результат в обе стороны — подмножество отфильтрованных строк: ранее выбранные, но скрытые поиском
	 * строки снимаются, иначе массовое действие по payload `select` затронуло бы невидимые данные.
	 * Выбор disabled-строк не меняется: пользователь не может изменить его и чекбоксом строки.
	 * Если `isKeepingOutOfScope` вернул `true` (область «страница»), выбор строк вне области сохраняется: на странице 2
	 * действие шапки не трогает выбор страницы 1.
	 */
	function toggleAll(): void {
		const selectable = selectableFilteredRows.value
		if (!selectable.length) return

		const shouldSelect = !isAllSelected.value
		const next = isKeepingOutOfScope() ? new Set(selectedIds.value) : collectDisabledSelectedIds(rows.value, selectedIds.value)
		for (const row of selectable) {
			if (shouldSelect) next.add(row.id)
			else next.delete(row.id)
		}
		applySelection(next)
	}

	function clearSelection(): void {
		if (selectedIds.value.size === 0) return
		applySelection(new Set())
	}

	return {
		selectedIds,
		selectedRows,
		isAllSelected,
		isSomeSelected,
		isSelectAllDisabled,
		hiddenSelectedCount,
		isSelected,
		toggleRow,
		toggleAll,
		clearSelection,
	}
}

export { useTableSelection }

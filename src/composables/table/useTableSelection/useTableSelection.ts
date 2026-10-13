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
	const { rows, filteredRows = rows, onSelect, onSelectedIdsChange } = options
	const isControlled = (): boolean => options.selectedIds?.() !== undefined

	const internalIds = ref<Set<string | number>>(collectSelectedIds(rows.value))
	const selectedIds = computed((): Set<string | number> => {
		const controlled = options.selectedIds?.()
		return controlled ? new Set(controlled) : internalIds.value
	})
	const selectedRows = computed((): TableRow[] => rows.value.filter(row => selectedIds.value.has(row.id)))

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

	/** Доступных строк в отфильтрованном наборе нет (всё скрыто поиском или отключено) — «Выбрать все» неактивен */
	const isSelectAllDisabled = computed((): boolean => selectableFilteredRows.value.length === 0)

	function toggleRow(row: TableRow): void {
		applySelection(toggleSelectedId(selectedIds.value, row.id))
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
		isSelected,
		toggleRow,
		toggleAll,
		clearSelection,
	}
}

export { useTableSelection }

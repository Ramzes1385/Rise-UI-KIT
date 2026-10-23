/** Composable: состояние «Выбрать все» — доступные строки отфильтрованного набора и признаки выбора */
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

function useTableSelectAllState(filteredRows: Ref<TableRow[]>, selectedIds: ComputedRef<Set<string | number>>) {
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

	return { selectableFilteredRows, isAllSelected, isSomeSelected, isSelectAllDisabled }
}

export { useTableSelectAllState }

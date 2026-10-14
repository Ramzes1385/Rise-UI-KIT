/** Composable: сколько выбранных строк скрыто поиском или фильтрами */
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

function useTableHiddenSelection(
	rows: Ref<TableRow[]>,
	visibleRows: Ref<TableRow[]>,
	selectedIds: ComputedRef<Set<string | number>>,
): ComputedRef<number> {
	return computed((): number => {
		if (selectedIds.value.size === 0) return 0
		const visible = new Set(visibleRows.value.map(row => row.id))
		return rows.value.filter(row => selectedIds.value.has(row.id) && !visible.has(row.id)).length
	})
}

export { useTableHiddenSelection }

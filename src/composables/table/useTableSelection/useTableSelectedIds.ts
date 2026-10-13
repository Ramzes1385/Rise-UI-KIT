/** Composable: набор выбранных id таблицы — внутренний или управляемый снаружи */
import { computed, ref } from 'vue'
import { collectSelectedIds } from './useTableSelectionUtils'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableSelectionOptions } from './types/useTableSelection.types'

function useTableSelectedIds(options: UseTableSelectionOptions) {
	const { rows } = options
	const isControlled = (): boolean => options.selectedIds?.() !== undefined

	const internalIds = ref<Set<string | number>>(collectSelectedIds(rows.value))
	const selectedIds = computed((): Set<string | number> => {
		const controlled = options.selectedIds?.()
		return controlled ? new Set(controlled) : internalIds.value
	})
	const selectedRows = computed((): TableRow[] => rows.value.filter(row => selectedIds.value.has(row.id)))

	return { isControlled, internalIds, selectedIds, selectedRows }
}

export { useTableSelectedIds }

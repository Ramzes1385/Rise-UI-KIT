import { ref, watch } from 'vue'

import type { TableRow } from './BaseTable.types'
import type { UseTableExpandOptions, UseTableExpandReturn } from './useTableExpand.types'

function useTableExpand(options: UseTableExpandOptions): UseTableExpandReturn {
	const { rows, emit } = options

	const expandedIds = ref<Set<string | number>>(new Set())

	function isExpanded(row: TableRow): boolean {
		return expandedIds.value.has(row.id)
	}

	watch(
		rows,
		() => {
			const next = new Set(expandedIds.value)
			for (const row of rows()) {
				if (row.isExpanded) next.add(row.id)
			}
			expandedIds.value = next
		},
		{ immediate: true },
	)

	function toggleExpand(row: TableRow): void {
		const isCurrentlyExpanded = expandedIds.value.has(row.id)
		const next = new Set(expandedIds.value)
		if (isCurrentlyExpanded) {
			next.delete(row.id)
		} else {
			next.add(row.id)
		}
		expandedIds.value = next
		emit('expand', { ...row, isExpanded: !isCurrentlyExpanded })
	}

	function handleRowClick(row: TableRow): void {
		emit('row-click', row)
		if (row.isExpandable || row.children?.length) {
			toggleExpand(row)
		}
	}

	return {
		expandedIds,
		isExpanded,
		toggleExpand,
		handleRowClick,
	}
}

export { useTableExpand }

import type { ComputedRef } from 'vue'
import type { BaseTableEmits, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableExpandOptions {
	rows: () => TableRow[]
	/** Раскрытые id снаружи (`v-model:expandedIds`); `undefined` — набор внутренний */
	expandedIds?: () => ReadonlyArray<string | number> | undefined
	emit: BaseTableEmits
}

export interface UseTableExpandReturn {
	expandedIds: ComputedRef<Set<string | number>>
	isExpanded: (row: TableRow) => boolean
	toggleExpand: (row: TableRow) => void
	handleRowClick: (row: TableRow) => void
}

import type { Ref } from 'vue'

import type { BaseTableEmits, TableRow } from './BaseTable.types'

export interface UseTableExpandOptions {
	rows: () => TableRow[]
	emit: BaseTableEmits
}

export interface UseTableExpandReturn {
	expandedIds: Ref<Set<string | number>>
	isExpanded: (row: TableRow) => boolean
	toggleExpand: (row: TableRow) => void
	handleRowClick: (row: TableRow) => void
}

import type { Ref } from 'vue'
import type { TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableColumnsDerivedOptions {
	localColumns: Ref<TableColumn[]>
	rows: Ref<TableRow[]>
	isResizable: () => boolean
	hasRowNumber: () => boolean
	isSelectable: () => boolean
	pageSize: () => number
}

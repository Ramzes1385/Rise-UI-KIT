import { computed, ref } from 'vue'
import type { TableRow } from '../types/BaseTable.types'
import type { BaseTableBodyProps } from '../types/body/BaseTableBody.types'

const EMPTY_CLASSES = { root: 'base-table__empty', title: 'base-table__empty-text' }
const LOADING_MORE_CLASSES = { root: 'base-table__loading-more', animation: 'base-table__loading-more-icon' }
const SKELETON_WIDTHS = ['72%', '48%', '60%', '84%', '40%']

export function useBaseTableBody(props: Pick<BaseTableBodyProps, 'rows'>) {
	const activeRowId = ref<TableRow['id'] | null>(null)
	const tabbableRowId = computed(() => {
		const isActiveShown = props.rows.some(row => row.id === activeRowId.value)
		return isActiveShown ? activeRowId.value : props.rows[0]?.id
	})
	return {
		emptyClasses: EMPTY_CLASSES,
		loadingMoreClasses: LOADING_MORE_CLASSES,
		getSkeletonWidth: (row: number, column: number): string => SKELETON_WIDTHS[(row + column) % SKELETON_WIDTHS.length],
		getRowTabIndex: (row: TableRow): number => (row.id === tabbableRowId.value ? 0 : -1),
		setActiveRow: (row: TableRow): void => {
			activeRowId.value = row.id
		},
	}
}

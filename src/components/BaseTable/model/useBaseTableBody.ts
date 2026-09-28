const EMPTY_CLASSES = { root: 'base-table__empty', title: 'base-table__empty-text' }
const LOADING_MORE_CLASSES = { root: 'base-table__loading-more', animation: 'base-table__loading-more-icon' }
const SKELETON_WIDTHS = ['72%', '48%', '60%', '84%', '40%']

export function useBaseTableBody() {
	return {
		emptyClasses: EMPTY_CLASSES,
		loadingMoreClasses: LOADING_MORE_CLASSES,
		getSkeletonWidth: (row: number, column: number): string => SKELETON_WIDTHS[(row + column) % SKELETON_WIDTHS.length],
	}
}

/** Composable: логика BaseTableBody — оформление пустого состояния, подгрузки и строк-заглушек */
/** Класс заголовка пустого состояния сохраняет прежний селектор .base-table__empty-text для приложений и тестов */
const EMPTY_CLASSES = { root: 'base-table__empty', title: 'base-table__empty-text' }
/** Индикатор подгрузки в строку: спиннер 20px и подпись справа от него */
const LOADING_MORE_CLASSES = { root: 'base-table__loading-more', animation: 'base-table__loading-more-icon' }
/** Ширины скелетонов в ячейках: повторяющийся узор, чтобы строки-заглушки не выглядели одинаковыми */
const SKELETON_WIDTHS = ['72%', '48%', '60%', '84%', '40%']

export function useBaseTableBody() {
	return {
		emptyClasses: EMPTY_CLASSES,
		loadingMoreClasses: LOADING_MORE_CLASSES,
		getSkeletonWidth: (row: number, column: number): string => SKELETON_WIDTHS[(row + column) % SKELETON_WIDTHS.length],
	}
}

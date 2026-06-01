/**
 * Опции composable useListNavigation
 */
export interface UseListNavigationOptions {
	/** Количество элементов в списке */
	itemCount: () => number
	/** Callback при выборе элемента (Enter) */
	onSelect: (index: number) => void
	/** Callback при нажатии Escape */
	onEscape?: () => void
	/** Поддержка циклической навигации (по умолчанию false) */
	isLoop?: boolean
}

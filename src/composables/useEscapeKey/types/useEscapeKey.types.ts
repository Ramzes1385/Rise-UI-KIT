/**
 * Опции composable useEscapeKey
 */
export interface UseEscapeKeyOptions {
	/** Активен ли слушатель (компонент открыт) */
	isActive: () => boolean
	/** Callback при нажатии Escape */
	callback: () => void
}

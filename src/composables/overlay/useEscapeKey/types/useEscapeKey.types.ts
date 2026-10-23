/**
 * Опции composable useEscapeKey
 */
export interface UseEscapeKeyOptions {
	/** Активен ли слушатель (компонент открыт) */
	isActive: () => boolean
	/** Callback при нажатии Escape */
	callback: () => void
	/**
	 * Принимает ли компонент Escape сейчас (по умолчанию — всегда, пока открыт). `false` — Escape получает слой ниже:
	 * немодальная панель закрывается по Escape, только когда фокус внутри неё
	 */
	isTarget?: () => boolean
}

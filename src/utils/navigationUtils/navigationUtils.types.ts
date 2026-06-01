/** Параметры навигации */
interface NavigateOptions {
	/** Внутренний маршрут */
	to?: string
	/** Внешняя ссылка */
	href?: string
	/** Целевое окно для внешней ссылки */
	target?: '_blank' | '_self'
}

export type { NavigateOptions }

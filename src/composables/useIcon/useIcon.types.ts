/**
 * Возвращаемое значение composable useIcon.
 */
export interface UseIconReturn {
	/** Путь к SVG-спрайту */
	spritePath: string
	/** Получить URL иконки по имени */
	getIconUrl: (name: string) => string
	/** Проверить, существует ли иконка в спрайте */
	isIconExists: (name: string, names: string[]) => boolean
	/** Получить все доступные имена иконок из спрайта */
	getIconNames: () => string[]
}

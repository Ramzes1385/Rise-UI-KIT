/**
 * Composable для работы с SVG-иконками из спрайта.
 * Спрайт генерируется Vite-плагином из папки src/assets/svg/.
 */

/** Путь к спрайту относительно корня */
const SPRITE_PATH = '/icons.svg'

/**
 * Возвращает URL иконки из спрайта по имени файла.
 * @param name — имя SVG-файла без расширения (например 'close')
 */
function getIconUrl(name: string): string {
	return `${SPRITE_PATH}#${name}`
}

/**
 * Проверяет, существует ли иконка с заданным именем.
 * Список известных иконок формируется из спрайта при сборке.
 * @param name — имя SVG-файла без расширения
 * @param names — массив доступных имён иконок
 */
function isIconExists(name: string, names: string[]): boolean {
	return names.includes(name)
}

/**
 * Возвращает массив имён всех иконок из спрайта.
 * Имена извлекаются из DOM: спрайт загружается как <svg> с <symbol> элементами.
 */
function getIconNames(): string[] {
	const sprite = document.querySelector(`svg[href="${SPRITE_PATH}"], link[href="${SPRITE_PATH}"]`)
	if (!sprite) return []

	const symbols = sprite.querySelectorAll('symbol')
	return Array.from(symbols).map(s => s.id)
}

/**
 * Composable для работы с иконками.
 * Предоставляет утилиты для получения URL иконок из спрайта.
 */
export function useIcon() {
	return {
		/** Путь к SVG-спрайту */
		spritePath: SPRITE_PATH,
		/** Получить URL иконки по имени */
		getIconUrl,
		/** Проверить существование иконки */
		isIconExists,
		/** Получить список имён иконок из спрайта */
		getIconNames,
	}
}

/**
 * Composable для работы с SVG-иконками из спрайта.
 * Спрайт генерируется Vite-плагином из директории src/icons/svg.
 *
 * Путь относительный — резолвится относительно base URL текущего документа.
 * Корректно работает в Vite dev, Storybook dev и в Storybook build под подпапкой (GH Pages).
 */

const SPRITE_PATH = 'icons.svg'

function getIconUrl(name: string): string {
	return `${SPRITE_PATH}#${name}`
}

function isIconExists(name: string, names: string[]): boolean {
	return names.includes(name)
}

function getIconNames(): string[] {
	const sprite = document.querySelector(`svg[href="${SPRITE_PATH}"], link[href="${SPRITE_PATH}"]`)
	if (!sprite) return []

	const symbols = sprite.querySelectorAll('symbol')
	return Array.from(symbols).map(symbol => symbol.id)
}

export function useIcon() {
	return {
		spritePath: SPRITE_PATH,
		getIconUrl,
		isIconExists,
		getIconNames,
	}
}

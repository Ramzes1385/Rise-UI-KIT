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

/**
 * Composable для работы с SVG-иконками из спрайта.
 * Путь резолвится относительного base URL документа.
 */
function useIcon() {
	return {
		spritePath: SPRITE_PATH,
		getIconUrl,
		isIconExists,
		getIconNames,
	}
}

export { useIcon }

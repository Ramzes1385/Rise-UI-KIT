/** Composable: работа с SVG-иконками из спрайта */
import { UI_ICON_SPRITE_PATH } from '@constants'
import type { UseIconReturn } from './useIcon.types'

function getIconUrl(name: string): string {
	return `${UI_ICON_SPRITE_PATH}#${name}`
}

function isIconExists(name: string, names: string[]): boolean {
	return names.includes(name)
}

function getIconNames(): string[] {
	const sprite = document.querySelector(`svg[href="${UI_ICON_SPRITE_PATH}"], link[href="${UI_ICON_SPRITE_PATH}"]`)
	if (!sprite) return []

	const symbols = sprite.querySelectorAll('symbol')
	return Array.from(symbols).map(symbol => symbol.id)
}

/**
 * Composable для работы с SVG-иконками из спрайта.
 * Путь резолвится относительного base URL документа.
 */
function useIcon(): UseIconReturn {
	return {
		spritePath: UI_ICON_SPRITE_PATH,
		getIconUrl,
		isIconExists,
		getIconNames,
	}
}

export { useIcon }

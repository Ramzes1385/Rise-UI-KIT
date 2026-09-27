/** Composable: работа с SVG-иконками из спрайта */
import { hasInjectionContext, inject } from 'vue'
import { UI_ICON_SPRITE_PATH } from '@constants'
import type { UseIconReturn } from './useIcon.types'
import type { InjectionKey } from 'vue'

/**
 * Ключ provide/inject пути к SVG-спрайту: его задают createIconPlugin({ spritePath })
 * и createUiKitPlugin({ iconSpritePath }). Symbol.for, а не Symbol(): подпути пакета
 * (корень, ./plugins, ./composables) могут оказаться разными копиями модуля, а ключ должен совпадать.
 */
const ICON_SPRITE_PATH_KEY: InjectionKey<string> = Symbol.for('rise-ui-kit.icon-sprite-path')

function isIconExists(name: string, names: string[]): boolean {
	return names.includes(name)
}

/** Путь к спрайту из плагина; вне setup inject недоступен — используется прежний путь по умолчанию */
function resolveSpritePath(): string {
	if (!hasInjectionContext()) return UI_ICON_SPRITE_PATH
	return inject(ICON_SPRITE_PATH_KEY, UI_ICON_SPRITE_PATH)
}

/**
 * Composable для работы с SVG-иконками из спрайта.
 * Путь по умолчанию ('icons.svg') относительный и резолвится от URL документа: на вложенных маршрутах SPA
 * (/a/b → /a/icons.svg) спрайт не найдётся, поэтому приложению нужен абсолютный путь через плагин.
 */
function useIcon(): UseIconReturn {
	const spritePath = resolveSpritePath()

	function getIconUrl(name: string): string {
		return `${spritePath}#${name}`
	}

	function getIconNames(): string[] {
		const sprite = document.querySelector(`svg[href="${spritePath}"], link[href="${spritePath}"]`)
		if (!sprite) return []

		const symbols = sprite.querySelectorAll('symbol')
		return Array.from(symbols).map(symbol => symbol.id)
	}

	return {
		spritePath,
		getIconUrl,
		isIconExists,
		getIconNames,
	}
}

export { ICON_SPRITE_PATH_KEY, useIcon }

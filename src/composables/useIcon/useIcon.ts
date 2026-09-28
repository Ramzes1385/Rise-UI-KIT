/** Composable: работа с SVG-иконками из спрайта */
import { hasInjectionContext, inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { IconMap, ResolvedIcon, UseIconReturn } from './types/useIcon.types'

/** Путь к SVG-спрайту по умолчанию — файл рядом со страницей; экспортируется из `/icons` */
export const ICON_SPRITE_PATH = 'icons.svg'

/**
 * Ключ provide/inject пути к SVG-спрайту: его задают createIconPlugin({ spritePath })
 * и createUiKitPlugin({ iconSpritePath }). Symbol.for, а не Symbol(): подпути пакета
 * (корень, ./plugins, ./composables) могут оказаться разными копиями модуля, а ключ должен совпадать.
 */
const ICON_SPRITE_PATH_KEY: InjectionKey<string> = Symbol.for('rise-ui-kit.icon-sprite-path')

/** Ключ provide/inject замен иконок: `createUiKitPlugin({ icons })` и `createIconPlugin({ icons })` */
const ICON_MAP_KEY: InjectionKey<IconMap> = Symbol.for('rise-ui-kit.icon-map')

function isIconExists(name: string, names: string[]): boolean {
	return names.includes(name)
}

/** Путь к спрайту из плагина; вне setup inject недоступен — используется прежний путь по умолчанию */
function resolveSpritePath(): string {
	if (!hasInjectionContext()) return ICON_SPRITE_PATH
	return inject(ICON_SPRITE_PATH_KEY, ICON_SPRITE_PATH)
}

function resolveIconMap(): IconMap {
	if (!hasInjectionContext()) return {}
	return inject(ICON_MAP_KEY, {})
}

/**
 * Composable для работы с SVG-иконками из спрайта.
 * Путь по умолчанию ('icons.svg') относительный и резолвится от URL документа: на вложенных маршрутах SPA
 * (/a/b → /a/icons.svg) спрайт не найдётся, поэтому приложению нужен абсолютный путь через плагин.
 */
function useIcon(): UseIconReturn {
	const spritePath = resolveSpritePath()
	const iconMap = resolveIconMap()

	function getIconUrl(name: string): string {
		return `${spritePath}#${name}`
	}

	/** Замена из плагина: компонент, полный адрес символа (есть `#`) или другое имя в спрайте кита */
	function resolveIcon(name: string): ResolvedIcon {
		const replacement = iconMap[name]
		if (replacement === undefined) return { url: getIconUrl(name) }
		if (typeof replacement !== 'string') return { component: replacement, url: '' }
		return { url: replacement.includes('#') ? replacement : getIconUrl(replacement) }
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
		resolveIcon,
	}
}

export { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY, useIcon }

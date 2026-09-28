import type { Component } from 'vue'

/**
 * Замена иконок кита своими: `createUiKitPlugin({ icons })`. Ключ — имя иконки кита (`close`, `chevron-down`…),
 * значение — имя символа в спрайте, полный адрес символа (`/my-icons.svg#x`) или Vue-компонент с `<svg>`
 */
export type IconMap = Record<string, string | Component>

/** Чем рисуется иконка: символ спрайта или компонент из IconMap */
export interface ResolvedIcon {
	/** Компонент из IconMap */
	component?: Component
	/** Адрес символа спрайта для `<use href>` */
	url: string
}

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
	/** Иконка с учётом замен из плагина (`icons`) */
	resolveIcon: (name: string) => ResolvedIcon
}

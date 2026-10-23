import type { IconMap } from '@composables/app/useIcon/types/useIcon.types'

/** Опции плагина глобальной регистрации BaseIcon. */
export interface IconPluginOptions {
	/** Имя компонента для глобальной регистрации. */
	componentName?: string
	/**
	 * Путь к SVG-спрайту для BaseIcon (например '/assets/icons.svg' или URL из импорта '…/icons.svg?url').
	 * По умолчанию 'icons.svg' — относительный путь, который на вложенных маршрутах SPA резолвится неверно.
	 */
	spritePath?: string
	/** Замена иконок кита своими: имя символа, полный адрес символа или компонент (см. `IconMap`) */
	icons?: IconMap
}

/**
 * Плагин: глобальная регистрация BaseIcon через app.use().
 * Нужен, когда проекту удобнее подключить иконку один раз на уровне приложения.
 */

import BaseIcon from '@components/BaseIcon/ui/BaseIcon.vue'
import { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY } from '@composables/useIcon/useIcon'
import type { App, Plugin } from 'vue'
import type { IconPluginOptions } from './types/iconPlugin.types'

function createIconPlugin(options?: IconPluginOptions): Plugin {
	const name = options?.componentName ?? 'BaseIcon'

	return {
		install(app: App): void {
			app.component(name, BaseIcon)
			if (options?.spritePath) app.provide(ICON_SPRITE_PATH_KEY, options.spritePath)
			if (options?.icons) app.provide(ICON_MAP_KEY, options.icons)
		},
	}
}

export { createIconPlugin }

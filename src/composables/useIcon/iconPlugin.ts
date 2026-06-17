/**
 * Vue-плагин для глобальной регистрации BaseIcon.
 * Нужен, когда проекту удобнее подключить иконку один раз через app.use().
 */

import BaseIcon from '@components/BaseIcon/ui/BaseIcon.vue'
import type { App, Plugin } from 'vue'

export interface IconPluginOptions {
	/** Имя компонента для глобальной регистрации. */
	componentName?: string
}

function createIconPlugin(options?: IconPluginOptions): Plugin {
	const name = options?.componentName ?? 'BaseIcon'

	return {
		install(app: App): void {
			app.component(name, BaseIcon)
		},
	}
}

export { createIconPlugin }

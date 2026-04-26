/**
 * Vue-плагин для глобальной регистрации BaseIcon.
 * Позволяет использовать <BaseIcon> без импорта в каждом компоненте.
 */

import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import type { App, Plugin } from 'vue'

/** Опции плагина иконок */
export interface IconPluginOptions {
	/** Имя компонента для глобальной регистрации (по умолчанию 'BaseIcon') */
	componentName?: string
}

/**
 * Создаёт Vue-плагин для регистрации BaseIcon глобально.
 * После установки: app.use(iconPlugin()) — компонент доступен как <BaseIcon>.
 */
function createIconPlugin(options?: IconPluginOptions): Plugin {
	const name = options?.componentName ?? 'BaseIcon'

	return {
		install(app: App): void {
			app.component(name, BaseIcon)
		},
	}
}

export { createIconPlugin }

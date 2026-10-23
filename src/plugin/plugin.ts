import { en } from '../locales/en'
import type { App, Plugin } from 'vue'
import { applyOptions } from './options'
import { registerLocaleOnce } from '../locales/state'
import { UI_COMPONENTS } from './registry/components'
import type { UiKitPluginOptions } from './types/plugin.types'

/** Плагин кита: регистрирует все компоненты и подключает английский словарь (`en`), если приложение не зарегистрировало свой */
export function createUiKitPlugin(options: UiKitPluginOptions = {}): Plugin {
	return {
		install(app: App): void {
			registerLocaleOnce(en)
			const prefix = options.prefix ?? ''
			Object.entries(UI_COMPONENTS).forEach(([name, component]) => app.component(`${prefix}${name}`, component))
			applyOptions(app, options)
		},
	}
}

export const uiKitPlugin = /* @__PURE__ */ createUiKitPlugin()

export default uiKitPlugin

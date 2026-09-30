import type { App, Plugin } from 'vue'
import { applyOptions } from './options'
import { UI_COMPONENTS } from './registry/components'
import type { UiKitPluginOptions } from './types/plugin.types'

export function createUiKitPlugin(options: UiKitPluginOptions = {}): Plugin {
	return {
		install(app: App): void {
			const prefix = options.prefix ?? ''
			Object.entries(UI_COMPONENTS).forEach(([name, component]) => app.component(`${prefix}${name}`, component))
			applyOptions(app, options)
		},
	}
}

export const uiKitPlugin = createUiKitPlugin()

export default uiKitPlugin

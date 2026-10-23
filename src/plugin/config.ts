/** Плагин настроек кита без регистрации компонентов: не импортирует реестр, поэтому JS компонентов в сборку не попадает. */

import type { App, Plugin } from 'vue'
import { applyOptions } from './options'
import type { UiKitConfigOptions } from './types/plugin.types'

export function createUiKitConfig(options: UiKitConfigOptions = {}): Plugin {
	return {
		install(app: App): void {
			applyOptions(app, options)
		},
	}
}

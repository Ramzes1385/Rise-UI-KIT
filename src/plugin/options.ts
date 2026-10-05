/** Настройки плагина: значения для provide, язык и тема. */

import { setLocale } from '../locales/state'
import type { App, InjectionKey } from 'vue'
import type { UiKitPluginOptions } from './types/plugin.types'
import { useTheme } from '../composables/app/useTheme/useTheme'
import { DEFAULTS_KEY } from '../composables/base/useDefaults/useDefaults'
import { LINK_COMPONENT_KEY } from '../composables/interaction/useLink/useLink'
import { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY } from '../composables/app/useIcon/useIcon'
import { TELEPORT_TARGET_KEY } from '../composables/app/useTeleportTarget/useTeleportTarget'

function provideIfSet<T>(app: App, key: InjectionKey<T>, value: T | undefined): void {
	if (value) app.provide(key, value)
}

function applyThemeOptions({ theme, themes, themeNonce }: UiKitPluginOptions): void {
	if (!theme && !themes && !themeNonce) return
	const controller = useTheme({ themes, nonce: themeNonce })
	if (theme) controller.setTheme(theme)
}

export function applyOptions(app: App, options: UiKitPluginOptions): void {
	provideIfSet(app, ICON_SPRITE_PATH_KEY, options.iconSpritePath)
	provideIfSet(app, DEFAULTS_KEY, options.defaults)
	provideIfSet(app, ICON_MAP_KEY, options.icons)
	provideIfSet(app, LINK_COMPONENT_KEY, options.linkComponent)
	provideIfSet(app, TELEPORT_TARGET_KEY, options.teleportTo)
	if (options.locale) setLocale(options.locale)
	applyThemeOptions(options)
}

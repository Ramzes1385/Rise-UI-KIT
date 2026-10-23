/** Настройки кита: значения для provide, язык, тема и движение; общие для `createUiKitPlugin` и `createUiKitConfig`. */

import { setLocale } from '../locales/state'
import type { App, InjectionKey } from 'vue'
import type { UiKitConfigOptions } from './types/plugin.types'
import { useTheme } from '../composables/app/useTheme/useTheme'
import { DEFAULTS_KEY } from '../composables/base/useDefaults/useDefaults'
import { LINK_COMPONENT_KEY } from '../composables/interaction/useLink/useLink'
import { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY } from '../composables/app/useIcon/useIcon'
import { TELEPORT_TARGET_KEY } from '../composables/app/useTeleportTarget/useTeleportTarget'
import { MOTION_ATTRIBUTE, REDUCED_MOTION_ATTRIBUTE } from '../composables/app/useMotion/motionTokens'

function provideIfSet<T>(app: App, key: InjectionKey<T>, value: T | undefined): void {
	if (value) app.provide(key, value)
}

function applyThemeOptions({ theme, themes, themeNonce }: UiKitConfigOptions): void {
	if (!theme && !themes && !themeNonce) return
	const controller = useTheme({ themes, nonce: themeNonce })
	if (theme) controller.setTheme(theme)
}

/** Пресет и «движение выключено всегда» — атрибутами на <html>: их читают и CSS (`_motion.scss`), и `useMotion` */
function applyMotion(options: UiKitConfigOptions): void {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	if (options.motion && !root.hasAttribute(MOTION_ATTRIBUTE)) root.setAttribute(MOTION_ATTRIBUTE, options.motion)
	if (options.reducedMotion === 'always') root.setAttribute(REDUCED_MOTION_ATTRIBUTE, 'always')
}

export function applyOptions(app: App, options: UiKitConfigOptions): void {
	provideIfSet(app, ICON_SPRITE_PATH_KEY, options.iconSpritePath)
	provideIfSet(app, DEFAULTS_KEY, options.defaults)
	provideIfSet(app, ICON_MAP_KEY, options.icons)
	provideIfSet(app, LINK_COMPONENT_KEY, options.linkComponent)
	provideIfSet(app, TELEPORT_TARGET_KEY, options.teleportTo)
	if (options.locale) setLocale(options.locale)
	applyThemeOptions(options)
	applyMotion(options)
}

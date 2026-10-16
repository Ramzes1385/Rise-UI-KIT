import './styles/kit.scss'
export * from './components'
export * as composables from './composables'
export { applyTheme, useColorMode, useLoadingBar, useLocale, useOverlay, useTheme, useToast } from './composables'
export type {
	ColorMode,
	IconMap,
	LinkComponent,
	OverlayCreateOptions,
	OverlayHandle,
	ResolvedColorMode,
	ToastAction,
	ToastId,
	ThemeController,
	ToastOptions,
	UiKitDefaults,
	UseLocaleReturn,
} from './composables'
export { defineLocale, en, formatMessage, kk, LOCALES, pluralize, registerLocale, ru, setLocale, uz } from './locales'
export type { LocaleInput, LocaleOverrides, PluralForms, UiKitLocale } from './locales'
export * as icons from './icons'
export { createUiKitPlugin, default, UI_COMPONENTS, uiKitPlugin } from './plugin'
export type { UiKitPluginOptions } from './plugin'
export * as utils from './utils'
export { createTheme, THEME_PRESETS } from './utils'
export type { Theme, ThemeInput, ThemePresetName } from './utils'

import type { LocaleInput, UiKitLocale } from '../../locales/types/locales.types'
import type { ThemePresetName } from '../../utils/theme/themeUtils/types/themeUtils.types'
import type { MotionPreset, ReducedMotionMode } from '../../composables/app/useMotion/types/useMotion.types'

/** Подключение токенов вместе с компонентами: `true` — `tokens.css`, `'layer'` — `tokens.layer.css` (токены в слое `rise`). */
export type RiseUiTokensMode = boolean | 'layer'

/** Что резолвер сообщает `unplugin-vue-components` о компоненте (`ComponentInfo` плагина). */
export interface RiseUiResolvedComponent {
	/** Имя экспорта в модуле `from` */
	name: string
	/** Модуль, из которого импортируется компонент */
	from: string
	/** Файлы, которые подключаются вместе с компонентом (`import '…'`) */
	sideEffects?: string | string[]
}

/** Резолвер для `unplugin-vue-components`: `Components({ resolvers: [RiseUiResolver()] })` (`ComponentResolverObject` плагина). */
export interface RiseUiComponentResolver {
	type: 'component'
	resolve: (name: string) => RiseUiResolvedComponent | undefined
}

/** Настройки `RiseUiResolver`. */
export interface RiseUiResolverOptions {
	/**
	 * Префикс имён в шаблонах: `prefix: 'Ui'` — `<UiBaseButton>`, как `prefix` у `createUiKitPlugin`. Свой `prefix` у
	 * `unplugin-vue-components` относится к компонентам из папок приложения и на резолверы не действует.
	 * Без опции — имена как есть (`<BaseButton>`)
	 */
	prefix?: string
	/** Импортировать токены вместе с компонентами, без `import '…/tokens.css'` в точке входа. По умолчанию `false` */
	tokens?: RiseUiTokensMode
}

/** Настройки `createUiKitConfig`, которые модуль Nuxt умеет передать в приложение: только значения, не функции и компоненты. */
export interface RiseUiNuxtConfig {
	/** Язык кита: `ru` (по умолчанию), `en`, `zh`, `ja`, `kk`, `uz`; для `zh` и `ja` модуль подключает и шрифт иероглифов (`/fonts/zh.css`) */
	locale?: Exclude<LocaleInput, UiKitLocale>
	/** Пресет темы: `corporate`, `playful`, `minimal`, `rise` */
	theme?: ThemePresetName
	/** Пресет движения всей страницы */
	motion?: MotionPreset
	/** `always` — движение выключено всегда */
	reducedMotion?: ReducedMotionMode
	/** Путь к SVG-спрайту иконок */
	iconSpritePath?: string
	/** CSS-селектор контейнера для окон, выпадающих панелей, тултипов и уведомлений */
	teleportTo?: string
	/** CSP nonce для `<style>` тем */
	themeNonce?: string
}

/** Настройки модуля Nuxt (`modules: [['@ramzes1385/rise-ui-kit/nuxt', options]]` или ключ `riseUiKit` в `nuxt.config`). */
export interface RiseUiNuxtOptions {
	/** Префикс имён компонентов: `prefix: 'Ui'` — `<UiBaseButton>`. По умолчанию без префикса */
	prefix?: string
	/** Токены: `true` (по умолчанию) — `tokens.css` в `css`, `'layer'` — `tokens.layer.css`, `false` — приложение подключает само */
	tokens?: RiseUiTokensMode
	/** Добавить пакет в `build.transpile` (нужно при SSR). По умолчанию `true` */
	transpile?: boolean
	/** Настройки кита (`createUiKitConfig`): модуль ставит плагин Nuxt, который применяет их на сервере и клиенте */
	config?: RiseUiNuxtConfig
}

/** Компонент, как его принимает хук Nuxt `components:extend` (подмножество `Component` из `@nuxt/schema`). */
export interface RiseUiNuxtComponent {
	pascalName: string
	kebabName: string
	export: string
	filePath: string
	shortPath: string
	chunkName: string
	prefetch: boolean
	preload: boolean
	global: boolean
	mode: 'all' | 'client' | 'server'
	priority: number
	meta: Record<string, unknown>
}

/** Часть объекта Nuxt, с которой работает модуль (структурно совместима с `Nuxt` из `@nuxt/schema`). */
export interface RiseUiNuxtLike {
	options: {
		css: string[]
		build: { transpile: (string | RegExp)[] }
		plugins: (string | { src: string; mode?: 'all' | 'client' | 'server' })[]
		runtimeConfig: { public: Record<string, unknown> }
		riseUiKit?: RiseUiNuxtOptions
	}
	hook: (name: 'components:extend', handler: (components: RiseUiNuxtComponent[]) => void) => unknown
}

/** Приложение Nuxt в runtime-плагине: `$config` и приложение Vue. */
export interface RiseUiNuxtApp {
	vueApp: { use: (plugin: unknown) => unknown }
	$config: { public: { riseUiKit?: RiseUiNuxtConfig } }
}

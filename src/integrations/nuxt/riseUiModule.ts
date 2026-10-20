/** Утилиты: модуль Nuxt — автоимпорт компонентов кита, токены, шрифт иероглифов, транспиляция и плагин настроек; без `@nuxt/kit` */

import { fileURLToPath } from 'node:url'
import { SUBPATH_COMPONENT_NAMES } from '../componentNames'
import type { RiseUiNuxtComponent, RiseUiNuxtConfig, RiseUiNuxtLike, RiseUiNuxtOptions } from '../types/integrations.types'

const PACKAGE = '@ramzes1385/rise-ui-kit'
const CONFIG_KEY = 'riseUiKit'
const NUXT_VERSION = '>=3.9.0'

const PLUGIN_FILE = './nuxt-plugin.js'

const DEFAULTS: Required<Pick<RiseUiNuxtOptions, 'prefix' | 'tokens' | 'transpile'>> = { prefix: '', tokens: true, transpile: true }

/** `BaseButton` → `base-button`, как у kebab-имён компонентов Nuxt */
export function kebabCase(name: string): string {
	return name.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
}

function createComponent(name: string, prefix: string): RiseUiNuxtComponent {
	const pascalName = `${prefix}${name}`
	const kebabName = kebabCase(pascalName)
	const filePath = `${PACKAGE}/${name}`
	return {
		pascalName,
		kebabName,
		export: name,
		filePath,
		shortPath: filePath,
		chunkName: `components/${kebabName}`,
		prefetch: false,
		preload: false,
		global: false,
		mode: 'all',
		priority: 0,
		meta: {},
	}
}

function hasPlugin(plugins: RiseUiNuxtLike['options']['plugins'], src: string): boolean {
	return plugins.some(plugin => (typeof plugin === 'string' ? plugin : plugin.src) === src)
}

function pushOnce<T>(list: T[], value: T): void {
	if (!list.includes(value)) list.push(value)
}

function tokensFile(tokens: RiseUiNuxtOptions['tokens']): string | undefined {
	if (!tokens) return undefined
	return `${PACKAGE}/${tokens === 'layer' ? 'tokens.layer.css' : 'tokens.css'}`
}

/**
 * Языки со своим шрифтом иероглифов. Словарь плагин Nuxt берёт из чанка, а не с подпути `/locales/zh`, который несёт шрифт, —
 * поэтому CSS шрифта (`/fonts/zh.css`) модуль кладёт в `css` сам, только для языка из настроек: остальным приложениям файлы не нужны.
 */
const FONT_LOCALES: readonly string[] = ['zh', 'ja']

function fontFile(locale: RiseUiNuxtConfig['locale']): string | undefined {
	return locale && FONT_LOCALES.includes(locale) ? `${PACKAGE}/fonts/${locale}.css` : undefined
}

/**
 * Настройка Nuxt модулем. Отдельная функция, чтобы проверять её без Nuxt: принимает объект `nuxt` и путь к плагину.
 * Порядок опций: умолчания, ключ `riseUiKit` в `nuxt.config`, опции модуля (кортеж в `modules`).
 */
export function setupRiseUi(inlineOptions: RiseUiNuxtOptions, nuxt: RiseUiNuxtLike, pluginPath: string): void {
	const options = { ...DEFAULTS, ...nuxt.options[CONFIG_KEY], ...inlineOptions }

	nuxt.hook('components:extend', components => {
		const known = new Set(components.map(component => component.pascalName))
		for (const name of SUBPATH_COMPONENT_NAMES) {
			if (!known.has(`${options.prefix}${name}`)) components.push(createComponent(name, options.prefix))
		}
	})

	const tokens = tokensFile(options.tokens)
	if (tokens) pushOnce(nuxt.options.css, tokens)
	const font = fontFile(options.config?.locale)
	if (font) pushOnce(nuxt.options.css, font)
	if (options.transpile) pushOnce(nuxt.options.build.transpile, PACKAGE)

	const config = options.config
	if (config && Object.keys(config).length > 0) {
		nuxt.options.runtimeConfig.public[CONFIG_KEY] = config
		if (!hasPlugin(nuxt.options.plugins, pluginPath)) nuxt.options.plugins.push({ src: pluginPath, mode: 'all' })
	}
}

/** Модуль Nuxt как функция `(options, nuxt)`: так Nuxt принимает модули, написанные без `defineNuxtModule` (проверено на Nuxt 4). */
function riseUiModule(inlineOptions: RiseUiNuxtOptions, nuxt: RiseUiNuxtLike): void {
	setupRiseUi(inlineOptions ?? {}, nuxt, fileURLToPath(new URL(PLUGIN_FILE, import.meta.url)))
}

riseUiModule.getMeta = () => Promise.resolve({ name: PACKAGE, configKey: CONFIG_KEY, compatibility: { nuxt: NUXT_VERSION } })

export default riseUiModule

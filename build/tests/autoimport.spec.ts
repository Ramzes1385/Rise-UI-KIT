/** Автоимпорт (src/integrations): резолвер для unplugin-vue-components, модуль Nuxt на заглушке `nuxt`, список имён и типы шаблонов. */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
	COMPONENT_NAMES_FILE,
	componentNamesSource,
	globalTypesSource,
	readPublicComponents,
	subpathExports,
	withSubpathExports,
} from '../config/subpaths'
import { SUBPATH_COMPONENT_NAMES } from '../../src/integrations/componentNames'
import { kebabCase, setupRiseUi } from '../../src/integrations/nuxt/riseUiModule'
import riseUiKitPlugin from '../../src/integrations/nuxt/runtimePlugin'
import { RiseUiResolver } from '../../src/integrations/resolver/riseUiResolver'
import riseUiModule from '../../src/integrations/nuxt/riseUiModule'
import type { RiseUiNuxtComponent, RiseUiNuxtLike } from '../../src/integrations/types/integrations.types'

const ROOT = resolve(import.meta.dirname, '../..')
const components = readPublicComponents(ROOT)
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { exports: Record<string, unknown> }

describe('список имён и exports автоимпорта', () => {
	it('componentNames.ts — ровно публичные компоненты (node scripts/generate-subpath-exports.mjs)', () => {
		expect([...SUBPATH_COMPONENT_NAMES]).toEqual(components)
		expect(readFileSync(resolve(ROOT, COMPONENT_NAMES_FILE), 'utf8')).toBe(componentNamesSource(components))
	})

	it('в exports есть ./resolver, ./nuxt и ./global — их ведёт генератор', () => {
		expect(pkg.exports['./resolver']).toEqual({ types: './dist/resolver.d.ts', import: './dist/resolver.js' })
		expect(pkg.exports['./nuxt']).toEqual({ types: './dist/nuxt.d.ts', import: './dist/nuxt.js' })
		expect(pkg.exports['./global']).toEqual({ types: './dist/global.d.ts' })
		expect(pkg.exports).toEqual(withSubpathExports(pkg.exports, ROOT))
		expect(Object.keys(subpathExports(ROOT))).toEqual(expect.arrayContaining(['./resolver', './nuxt', './global']))
	})

	it('sideEffects пакета не помечает резолвер и модуль Nuxt: у них нет побочных эффектов, сборщик вправе их свернуть', () => {
		const { sideEffects } = pkg as unknown as { sideEffects: string[] }
		expect(sideEffects.filter(pattern => /resolver|nuxt|global/.test(pattern))).toEqual([])
	})
})

describe('RiseUiResolver', () => {
	it('BaseX → импорт с подпути пакета, без sideEffects: CSS подключает сам подпуть', () => {
		expect(RiseUiResolver().resolve('BaseButton')).toEqual({ name: 'BaseButton', from: '@ramzes1385/rise-ui-kit/BaseButton' })
		expect(RiseUiResolver().resolve('BaseSelect')).toEqual({ name: 'BaseSelect', from: '@ramzes1385/rise-ui-kit/BaseSelect' })
	})

	it('резолвит каждый публичный компонент и тип `component`', () => {
		const resolver = RiseUiResolver()
		expect(resolver.type).toBe('component')
		for (const component of components) {
			expect(resolver.resolve(component)).toEqual({ name: component, from: `@ramzes1385/rise-ui-kit/${component}` })
		}
	})

	it('чужие и внутренние имена оставляет плагину: нет подпути — нет резолва', () => {
		const resolver = RiseUiResolver()
		for (const name of [
			'MyButton',
			'RouterLink',
			'Base',
			'BaseButtonX',
			'baseButton',
			'BaseImageMap3D',
			'BasePresentationPlayer',
			'',
		]) {
			expect(resolver.resolve(name)).toBeUndefined()
		}
	})

	it('prefix: `UiBaseButton` → BaseButton, имя без префикса не резолвится', () => {
		const resolver = RiseUiResolver({ prefix: 'Ui' })
		expect(resolver.resolve('UiBaseButton')).toEqual({ name: 'BaseButton', from: '@ramzes1385/rise-ui-kit/BaseButton' })
		expect(resolver.resolve('BaseButton')).toBeUndefined()
		expect(resolver.resolve('UiMyButton')).toBeUndefined()
	})

	it('tokens: токены подключаются как sideEffects каждого компонента, `layer` — вариант в слое rise', () => {
		expect(RiseUiResolver({ tokens: true }).resolve('BaseButton')).toEqual({
			name: 'BaseButton',
			from: '@ramzes1385/rise-ui-kit/BaseButton',
			sideEffects: ['@ramzes1385/rise-ui-kit/tokens.css'],
		})
		expect(RiseUiResolver({ tokens: 'layer' }).resolve('BaseButton')?.sideEffects).toEqual(['@ramzes1385/rise-ui-kit/tokens.layer.css'])
		expect(RiseUiResolver({ tokens: false }).resolve('BaseButton')).not.toHaveProperty('sideEffects')
	})

	it('плеер — подпуть /media и media.css: его стили не входят в подпуть', () => {
		expect(RiseUiResolver().resolve('BaseMediaPlayer')).toEqual({
			name: 'BaseMediaPlayer',
			from: '@ramzes1385/rise-ui-kit/media',
			sideEffects: ['@ramzes1385/rise-ui-kit/media.css'],
		})
		expect(RiseUiResolver({ tokens: true }).resolve('BaseMediaPlayer')?.sideEffects).toEqual([
			'@ramzes1385/rise-ui-kit/tokens.css',
			'@ramzes1385/rise-ui-kit/media.css',
		])
	})
})

function createNuxt(options: Partial<RiseUiNuxtLike['options']> = {}) {
	const hooks: Record<string, (components: RiseUiNuxtComponent[]) => void> = {}
	const nuxt: RiseUiNuxtLike = {
		options: { css: [], build: { transpile: [] }, plugins: [], runtimeConfig: { public: {} }, ...options },
		hook: (name, handler) => {
			hooks[name] = handler
		},
	}
	const extend = (existing: RiseUiNuxtComponent[] = []): RiseUiNuxtComponent[] => {
		hooks['components:extend']!(existing)
		return existing
	}
	return { nuxt, extend }
}

const PLUGIN = '/node_modules/@ramzes1385/rise-ui-kit/dist/nuxt-plugin.js'

describe('модуль Nuxt (на заглушке nuxt)', () => {
	it('components:extend добавляет все публичные компоненты с путями подпутей — как `addComponent` из @nuxt/kit', () => {
		const { nuxt, extend } = createNuxt()
		setupRiseUi({}, nuxt, PLUGIN)
		const added = extend()
		expect(added.map(component => component.pascalName)).toEqual(components)
		expect(added[0]).toEqual({
			pascalName: 'BaseAccordion',
			kebabName: 'base-accordion',
			export: 'BaseAccordion',
			filePath: '@ramzes1385/rise-ui-kit/BaseAccordion',
			shortPath: '@ramzes1385/rise-ui-kit/BaseAccordion',
			chunkName: 'components/base-accordion',
			prefetch: false,
			preload: false,
			global: false,
			mode: 'all',
			priority: 0,
			meta: {},
		})
	})

	it('prefix меняет имена, но не экспорт и не путь', () => {
		const { nuxt, extend } = createNuxt()
		setupRiseUi({ prefix: 'Ui' }, nuxt, PLUGIN)
		const button = extend().find(component => component.pascalName === 'UiBaseButton')
		expect(button).toMatchObject({ kebabName: 'ui-base-button', export: 'BaseButton', filePath: '@ramzes1385/rise-ui-kit/BaseButton' })
	})

	it('компонент приложения с тем же именем главнее: кит его не заменяет', () => {
		const { nuxt, extend } = createNuxt()
		setupRiseUi({}, nuxt, PLUGIN)
		const own = { pascalName: 'BaseButton', filePath: '/app/components/BaseButton.vue' } as RiseUiNuxtComponent
		const result = extend([own])
		expect(result.filter(component => component.pascalName === 'BaseButton')).toEqual([own])
		expect(result).toHaveLength(components.length)
	})

	it('токены и transpile — по умолчанию, без дублей при повторной установке', () => {
		const { nuxt } = createNuxt()
		setupRiseUi({}, nuxt, PLUGIN)
		setupRiseUi({}, nuxt, PLUGIN)
		expect(nuxt.options.css).toEqual(['@ramzes1385/rise-ui-kit/tokens.css'])
		expect(nuxt.options.build.transpile).toEqual(['@ramzes1385/rise-ui-kit'])
		expect(nuxt.options.plugins).toEqual([])
		expect(nuxt.options.runtimeConfig.public).toEqual({})
	})

	it('tokens: layer и false; transpile: false', () => {
		const layer = createNuxt()
		setupRiseUi({ tokens: 'layer', transpile: false }, layer.nuxt, PLUGIN)
		expect(layer.nuxt.options.css).toEqual(['@ramzes1385/rise-ui-kit/tokens.layer.css'])
		expect(layer.nuxt.options.build.transpile).toEqual([])
		const none = createNuxt({ css: ['~/main.css'] })
		setupRiseUi({ tokens: false }, none.nuxt, PLUGIN)
		expect(none.nuxt.options.css).toEqual(['~/main.css'])
	})

	it('config ставит плагин Nuxt один раз и кладёт настройки в runtimeConfig.public.riseUiKit', () => {
		const { nuxt } = createNuxt()
		const config = { locale: 'en', theme: 'corporate' as const }
		setupRiseUi({ config }, nuxt, PLUGIN)
		setupRiseUi({ config }, nuxt, PLUGIN)
		expect(nuxt.options.plugins).toEqual([{ src: PLUGIN, mode: 'all' }])
		expect(nuxt.options.runtimeConfig.public.riseUiKit).toEqual(config)
	})

	it('пустой config плагин не ставит; опции берутся из ключа riseUiKit в nuxt.config, кортеж модуля главнее', () => {
		const empty = createNuxt()
		setupRiseUi({ config: {} }, empty.nuxt, PLUGIN)
		expect(empty.nuxt.options.plugins).toEqual([])
		const keyed = createNuxt({ riseUiKit: { prefix: 'Ui', tokens: 'layer', config: { locale: 'ja' } } })
		setupRiseUi({ tokens: true }, keyed.nuxt, PLUGIN)
		expect(keyed.extend()[0]!.pascalName).toBe('UiBaseAccordion')
		expect(keyed.nuxt.options.css).toEqual(['@ramzes1385/rise-ui-kit/tokens.css'])
		expect(keyed.nuxt.options.runtimeConfig.public.riseUiKit).toEqual({ locale: 'ja' })
	})

	it('модуль — функция (options, nuxt) с getMeta: так Nuxt принимает модули без defineNuxtModule', async () => {
		expect(typeof riseUiModule).toBe('function')
		await expect(riseUiModule.getMeta()).resolves.toEqual({
			name: '@ramzes1385/rise-ui-kit',
			configKey: 'riseUiKit',
			compatibility: { nuxt: '>=3.9.0' },
		})
		const { nuxt } = createNuxt()
		riseUiModule({ config: { locale: 'en' } }, nuxt)
		expect(nuxt.options.css).toEqual(['@ramzes1385/rise-ui-kit/tokens.css'])
		expect(nuxt.options.plugins).toHaveLength(1)
		expect(JSON.stringify(nuxt.options.plugins[0])).toMatch(/nuxt-plugin\.js/)
		riseUiModule(undefined as never, createNuxt().nuxt)
	})

	it('kebabCase: Pascal → kebab', () => {
		expect(kebabCase('BaseButton')).toBe('base-button')
		expect(kebabCase('UiBaseInputNumber')).toBe('ui-base-input-number')
		expect(components.map(kebabCase).every(name => /^base-[a-z]+(?:-[a-z]+)*$/.test(name))).toBe(true)
	})

	it('runtime-плагин применяет настройки через createUiKitConfig на приложении Vue', () => {
		const used: unknown[] = []
		riseUiKitPlugin({ vueApp: { use: plugin => used.push(plugin) }, $config: { public: { riseUiKit: { locale: 'en' } } } })
		expect(used).toHaveLength(1)
		expect(typeof (used[0] as { install: unknown }).install).toBe('function')
	})
})

describe('типы шаблонов GlobalComponents (dist/global.d.ts)', () => {
	const source = globalTypesSource(['BaseButton', 'BaseSelect'])

	it('модуль-расширение vue: interface GlobalComponents с типом экспорта подпути на каждый компонент', () => {
		expect(source).toContain("declare module 'vue' {")
		expect(source).toContain('export interface GlobalComponents {')
		expect(source).toContain("BaseButton: typeof import('@ramzes1385/rise-ui-kit/BaseButton')['BaseButton']")
		expect(source).toContain("BaseSelect: typeof import('@ramzes1385/rise-ui-kit/BaseSelect')['BaseSelect']")
		expect(source.startsWith('export {}')).toBe(true)
	})

	it('на полном списке — по строке на публичный компонент, без плеера и 3D-карты', () => {
		const full = globalTypesSource(components)
		expect(full.match(/ typeof import\(/g)).toHaveLength(components.length)
		expect(full).not.toMatch(/BaseMediaPlayer|BaseImageMap3D/)
	})
})

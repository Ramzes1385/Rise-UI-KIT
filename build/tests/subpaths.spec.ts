/** Точечная установка (build/config/subpaths.ts): exports пакета, порядок CSS во входе подпути, метка токенов прохода CSS подпутей. */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Rollup } from 'vite'
import { componentOfModule, readPublicComponents, subpathExports, withSubpathExports } from '../config/subpaths'
import { createSubpathCssGroups, createSubpathScssOptions } from '../plugins/subpathCss'
import { collectStyleComponents, createSubpathEntries } from '../plugins/subpaths'

const ROOT = resolve(import.meta.dirname, '../..')
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { exports: Record<string, unknown> }
const components = readPublicComponents(ROOT)
const COMPONENTS_INDEX = readFileSync(resolve(ROOT, 'src/components/index.ts'), 'utf8')

describe('публичные компоненты и exports', () => {
	it('список подпутей — ровно реэкспорты src/components/index.ts', () => {
		const reexports = [...COMPONENTS_INDEX.matchAll(/^export \* from '\.\/(\w+)'$/gm)].map(([, name]) => name).sort()
		expect(components).toEqual(reexports)
		expect(COMPONENTS_INDEX.split('\n').filter(line => line.trim() && !line.startsWith('export * from'))).toEqual([])
	})

	it('exports в package.json совпадают со сгенерированными (node scripts/generate-subpath-exports.mjs)', () => {
		expect(pkg.exports).toEqual(withSubpathExports(pkg.exports, ROOT))
		expect(Object.keys(pkg.exports)).toEqual(Object.keys(withSubpathExports(pkg.exports, ROOT)))
	})

	it('у каждого подпути есть исходник, типы и JS лежат рядом в dist/components/<Имя>/', () => {
		for (const component of components) {
			expect(existsSync(resolve(ROOT, 'src/components', component, 'index.ts'))).toBe(true)
			expect(pkg.exports[`./${component}`]).toEqual({
				types: `./dist/components/${component}/index.d.ts`,
				import: `./dist/components/${component}/index.js`,
			})
		}
	})

	it('непубличное наружу не торчит: подпутей для плеера, 3D-карты и внутренних файлов нет', () => {
		const subpaths = Object.keys(pkg.exports).filter(key => /^\.\/Base/.test(key))
		expect(subpaths.sort()).toEqual(components.map(component => `./${component}`).sort())
		for (const hidden of ['./BaseMediaPlayer', './BasePresentationPlayer', './BaseImageMap3D'])
			expect(pkg.exports[hidden]).toBeUndefined()
		expect(Object.keys(pkg.exports).filter(key => key.includes('*'))).toEqual([])
		expect(Object.keys(subpathExports(ROOT))).toHaveLength(components.length + 2)
	})

	it('tokens.css и tokens.layer.css — в exports, как styles.css', () => {
		expect(pkg.exports['./tokens.css']).toEqual({
			types: './dist/styles.d.ts',
			import: './dist/tokens.css',
			default: './dist/tokens.css',
		})
		expect(pkg.exports['./tokens.layer.css']).toMatchObject({ import: './dist/tokens.layer.css' })
	})

	it('вход подпути — с побочным эффектом (sideEffects): иначе приложение выбросит его вместе с импортом CSS', () => {
		expect((pkg as unknown as { sideEffects: string[] }).sideEffects).toContain('./dist/components/*/index.js')
	})

	it('входы сборки — по одному на подпуть', () => {
		expect(Object.keys(createSubpathEntries(['BaseButton', 'BaseSelect']))).toEqual([
			'components/BaseButton/index',
			'components/BaseSelect/index',
		])
	})
})

describe('componentOfModule', () => {
	it('находит папку компонента у вложенных стилей, с query и путями Windows', () => {
		expect(componentOfModule('/repo/src/components/BaseChat/ui/ChatMessageList/styles/ChatMessageList.style.scss')).toBe('BaseChat')
		expect(componentOfModule('C:\\repo\\src\\components\\BaseButton\\styles\\BaseButton.style.scss?used')).toBe('BaseButton')
		expect(componentOfModule('/repo/src/styles/kit.scss')).toBeNull()
	})
})

function moduleGraph(graph: Record<string, string[]>): (id: string) => Rollup.ModuleInfo | null {
	return id => (graph[id] ? ({ importedIds: graph[id] } as unknown as Rollup.ModuleInfo) : null)
}

describe('collectStyleComponents', () => {
	const select = '/r/src/components/BaseSelect/ui/BaseSelect.vue'
	const selectStyle = '/r/src/components/BaseSelect/styles/BaseSelect.style.scss'
	const button = '/r/src/components/BaseButton/ui/BaseButton.vue'
	const buttonStyle = '/r/src/components/BaseButton/styles/BaseButton.style.scss'
	const icon = '/r/src/components/BaseIcon/ui/BaseIcon.vue'
	const iconStyle = '/r/src/components/BaseIcon/styles/BaseIcon.style.scss'

	it('порядок — как выполнение ESM: свой стиль первой строкой, затем стили импортированных компонентов', () => {
		const getModuleInfo = moduleGraph({
			entry: [select],
			[select]: [selectStyle, button, icon],
			[button]: [buttonStyle, icon],
			[icon]: [iconStyle],
			[selectStyle]: [],
			[buttonStyle]: [],
			[iconStyle]: [],
		})
		expect(collectStyleComponents(getModuleInfo, 'entry')).toEqual(['BaseSelect', 'BaseButton', 'BaseIcon'])
	})

	it('циклы и повторы не дублируют папку; модули без стилей не дают CSS', () => {
		const getModuleInfo = moduleGraph({
			entry: [button, '/r/src/utils/a.ts'],
			[button]: [buttonStyle, button],
			[buttonStyle]: [],
			'/r/src/utils/a.ts': [],
		})
		expect(collectStyleComponents(getModuleInfo, 'entry')).toEqual(['BaseButton'])
	})
})

describe('проход CSS подпутей', () => {
	const { additionalData } = createSubpathScssOptions() as { additionalData: (source: string, filename: string) => string }

	it('у стилей компонента метка — сразу после prelude, до @use самого файла', () => {
		const source = "@use './body/cell';\n.base-table{display:block}"
		const result = additionalData(source, '/r/src/components/BaseTable/styles/BaseTable.style.scss')
		expect(result.indexOf("@use 'rise:css-split-marker';")).toBeGreaterThan(result.indexOf('@use "@styles/functions" as *;'))
		expect(result.endsWith(`@use 'rise:css-split-marker';\n${source}`)).toBe(true)
	})

	it('kit.scss (tokens.css) и исходники prelude — без метки', () => {
		expect(additionalData('.a{}', '/r/src/styles/kit.scss')).not.toContain('rise:css-split-marker')
		expect(additionalData('$x: 1;', '/r/src/styles/_tokens.scss')).toBe('$x: 1;')
	})

	it('у каждой папки компонента своя группа чанков', () => {
		const groups = createSubpathCssGroups(['BaseButton', 'BaseIcon']) as { groups: { name: string; test: RegExp }[] }
		expect(groups.groups.map(group => group.name)).toEqual(['css-BaseButton', 'css-BaseIcon'])
		expect(groups.groups[0]!.test.test('C:\\r\\src\\components\\BaseButton\\ui\\BaseButton.vue')).toBe(true)
		expect(groups.groups[0]!.test.test('/r/src/components/BaseButtonGroup/ui/BaseButtonGroup.vue')).toBe(false)
	})
})

import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LAZY_COMPONENTS } from '../../src/plugin/registry/lazy'
import { LAZY_COMPONENT_NAMES } from '../../src/plugin/registry/lazyNames'

const BUILD_CONFIG = resolve(import.meta.dirname, '../config/build.lib.ts')
const COMPONENTS = resolve(import.meta.dirname, '../../src/components')

/** Относительные пути всех файлов папки (с `/` как разделителем) */
function listFiles(dir: string, base = ''): string[] {
	return readdirSync(resolve(dir, base), { withFileTypes: true }).flatMap(entry => {
		const path = base ? `${base}/${entry.name}` : entry.name
		return entry.isDirectory() ? listFiles(dir, path) : [path]
	})
}

/** Группы `LAZY_SHARED_GROUPS` из конфигурации сборки: имя и регулярка `test` (список не экспортируется — читаем исходник) */
function sharedGroups(): { name: string; test: RegExp }[] {
	const source = readFileSync(BUILD_CONFIG, 'utf8')
	const block = /const LAZY_SHARED_GROUPS = \[([\s\S]*?)\n\]\n/.exec(source)?.[1] ?? ''
	return [...block.matchAll(/name: '([\w-]+)',\s*test: \/(.+)\/,/g)].map(([, name, pattern]) => ({ name, test: new RegExp(pattern) }))
}

describe('ленивые компоненты плагина', () => {
	it('реестр содержит ровно компоненты из общего списка имён', () => {
		expect(Object.keys(LAZY_COMPONENTS).sort()).toEqual([...LAZY_COMPONENT_NAMES].sort())
	})

	it('конфигурация сборки пакета берёт чанки из того же списка и не держит своего', () => {
		const source = readFileSync(BUILD_CONFIG, 'utf8')
		expect(source).toContain("from '../../src/plugin/registry/lazyNames'")
		expect(source).toContain('LAZY_COMPONENT_NAMES.map(')
		expect(source).not.toMatch(/'Base(?:Calendar|Chat|DatePicker|Editor|FileUpload|Table)'/)
	})

	/** Модули, ради которых заведены группы: каждый должен существовать и попадать под регулярку своей группы */
	it.each([
		[
			'roadmap-shared',
			'BaseRoadmap',
			['ui/parts/RoadmapLegend.vue', 'model/view/format/roadmapLegend.ts', 'model/view/format/roadmapText.ts'],
		],
		[
			'flow-map-shared',
			'BaseFlowMap',
			[
				'ui/canvas/FlowSvgNode.vue',
				...['flowContext', 'scenarioContext'].map(name => `model/${name === 'flowContext' ? 'context' : 'scenario'}/${name}.ts`),
				...['resolveKind', 'registry'].map(name => `model/notations/${name}.ts`),
				...['compound', 'placement', 'useFlowLayout'].map(name => `model/layout/${name}.ts`),
				'model/render/shapes/flowShapes.ts',
				'model/execute/flowReject.ts',
				...['flowDiff', 'flowGraph', 'flowIds', 'flowValidate', 'flowMigrate', 'flowNormalize'].map(
					name => `model/data/${name}.ts`,
				),
			],
		],
	])('группа %s находит существующие файлы %s: переименование модуля не ломает её молча', (name, component, modules) => {
		const group = sharedGroups().find(item => item.name === name)
		expect(group, `в LAZY_SHARED_GROUPS нет группы ${name}`).toBeDefined()
		const files = listFiles(resolve(COMPONENTS, component))
		for (const module of modules) {
			expect(files, `${component}/${module} не найден`).toContain(module)
			expect(group!.test.test(`/${component}/${module}`), `${module} не под регулярку группы ${name}`).toBe(true)
		}
	})

	it('в BaseRoadmap под группу roadmap-shared попадает папка notices', () => {
		const group = sharedGroups().find(item => item.name === 'roadmap-shared')
		const notices = listFiles(resolve(COMPONENTS, 'BaseRoadmap')).filter(file => file.startsWith('ui/parts/notices/'))
		expect(notices.length).toBeGreaterThan(0)
		expect(notices.every(file => group!.test.test(`/BaseRoadmap/${file}`))).toBe(true)
	})
})

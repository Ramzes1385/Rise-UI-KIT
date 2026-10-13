import { scriptImports, scriptSource } from '../render/code/script'

const MODULE = [
	"import { ref } from 'vue'",
	"import '../styles/demo.scss'",
	'import type {',
	'\tTableRow,',
	'\tTableColumn,',
	"} from '@components/BaseTable'",
	'',
	'export interface Row {',
	'\tid: number',
	'}',
	'',
	'',
	'',
	'const rows: Row[] = [{ id: 1 }]',
	'',
	'export function setup() {',
	"\tconst message = ref('')",
	'',
	'\tfunction save(): void {',
	"\t\tmessage.value = 'ok'",
	'\t}',
	'',
	'\treturn {',
	'\t\trows,',
	'\t\tmessage,',
	'\t\tsave,',
	'\t}',
	'}',
	'',
].join('\n')

const SETUP_MODULES = import.meta.glob<string>('/src/stories/blocks/*/cases/*.setup.ts', { query: '?raw', import: 'default', eager: true })
const SETUPS = import.meta.glob<{ setup: () => Record<string, unknown> }>('/src/stories/blocks/*/cases/*.setup.ts', { eager: true })

describe('scriptSource', () => {
	it('без импортов и export, тело setup — на верхнем уровне без return', () => {
		expect(scriptSource(MODULE)).toBe(
			[
				'interface Row {',
				'\tid: number',
				'}',
				'',
				'const rows: Row[] = [{ id: 1 }]',
				'',
				"const message = ref('')",
				'',
				'function save(): void {',
				"\tmessage.value = 'ok'",
				'}',
			].join('\n'),
		)
	})

	it('модуль без setup и с переводами строк Windows — текст без импортов', () => {
		expect(scriptSource("import { ref } from 'vue'\r\n\r\nexport const count = 1\r\n")).toBe('const count = 1')
	})

	it('код после setup остаётся, setup без return — всё тело', () => {
		expect(scriptSource('function setup(): void {\n\tconst a = 1\n}\n\nconst b = 2')).toBe('const a = 1\n\nconst b = 2')
	})

	it('setup без закрывающей скобки — тело до конца текста', () => {
		expect(scriptSource('function setup() {\n\tconst a = 1')).toBe('const a = 1')
	})
})

describe('модули setup витрин Blocks', () => {
	it('найдены', () => {
		expect(Object.keys(SETUP_MODULES).length).toBeGreaterThanOrEqual(4)
	})

	it.each(Object.keys(SETUP_MODULES))('%s: код объявляет всё, что setup отдаёт превью', file => {
		const code = scriptSource(SETUP_MODULES[file])
		expect(code).not.toMatch(/^(?:import|export|return)\b/m)
		const declared = new Set([...code.matchAll(/^(?:const|(?:async\s+)?function)\s+([\w$]+)/gm)].map(match => match[1]))
		expect(Object.keys(SETUPS[file].setup()).filter(name => !declared.has(name))).toEqual([])
	})
})

describe('scriptImports', () => {
	const MODULE_WITH_IMPORTS = [
		"import { ref } from 'vue'",
		"import { seriesMedia } from '../media'",
		"import type { TabItem, TableRow } from '@components/BaseTabs'",
		"import type { MediaEpisode } from '@components/BaseMediaPlayer'",
		'import type {',
		'\tStandardSchemaV1,',
		"} from '@utils/form/formUtils'",
		"import { type UseX, useX } from '@composables/base/useX'",
	].join('\r\n')

	it('типы кита — в imports, подпути пакета и соседние файлы — в importsFrom, vue пропущен', () => {
		expect(scriptImports(MODULE_WITH_IMPORTS)).toEqual({
			imports: ['type TabItem', 'type TableRow'],
			importsFrom: {
				'./media': ['seriesMedia'],
				'@ramzes1385/rise-ui-kit/media': ['type MediaEpisode'],
				'@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaV1'],
				'@ramzes1385/rise-ui-kit/composables': ['type UseX', 'useX'],
			},
		})
	})

	it('extra дополняет, а не заменяет: компоненты шаблона и имена из того же подпути без повторов', () => {
		const result = scriptImports(MODULE_WITH_IMPORTS, {
			imports: ['BaseTabs'],
			importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] },
		})

		expect(result.imports).toEqual(['BaseTabs', 'type TabItem', 'type TableRow'])
		expect(result.importsFrom['@ramzes1385/rise-ui-kit/media']).toEqual(['BaseMediaPlayer', 'type MediaEpisode'])
	})

	it('неизвестный путь — ошибка, чтобы «Show code» не терял импорт молча', () => {
		expect(() => scriptImports("import type { A } from 'left-pad'")).toThrow('left-pad')
	})

	it.each(Object.keys(SETUP_MODULES))('%s: все типовые импорты модуля попали в «Show code»', file => {
		const { imports, importsFrom } = scriptImports(SETUP_MODULES[file])
		const shown = new Set([...imports, ...Object.values(importsFrom).flat()])
		const declared = [...SETUP_MODULES[file].matchAll(/^import (type )?\{([^}]*)\} from '(?!vue')/gm)].flatMap(([, type, list]) =>
			list.split(',').map(name => `${type ?? ''}${name.trim()}`),
		)

		expect(declared.filter(name => !shown.has(name))).toEqual([])
	})
})

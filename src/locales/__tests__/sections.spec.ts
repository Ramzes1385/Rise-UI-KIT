import { ru } from '../ru'
import ts from 'typescript'
import { resolve } from 'node:path'
import * as messages from '../messages'
import { readdirSync, readFileSync } from 'node:fs'

const LOCALES_DIR = resolve(__dirname, '..')
/** Конфиг сборки лежит вне проекта `tsconfig.app.json`: путь не литерал, чтобы vue-tsc не включал его в программу */
const BUILD_LIB = resolve(__dirname, '../../../build/config/build.lib.ts')
type RuGroup = { name: string; test: (id: string) => boolean; priority: number }
const { createRuLocaleGroups } = (await import(/* @vite-ignore */ BUILD_LIB)) as { createRuLocaleGroups: () => RuGroup[] }
const NOT_SECTIONS = ['code', 'intl', 'firstDayOfWeek', 'calendarNames', 'relativeTime']

function listFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = resolve(dir, entry.name)
		if (entry.isDirectory()) return entry.name === '__tests__' ? [] : listFiles(path)
		return entry.name.endsWith('.ts') ? [path] : []
	})
}

const norm = (path: string): string => path.replace(/\\/g, '/')
const sectionFiles = listFiles(resolve(LOCALES_DIR, 'sections'))
const ruFiles = listFiles(resolve(LOCALES_DIR, 'ru'))

/** Модуль раздела: имя экспорта, ключ раздела и русский объект из исходника */
const SECTIONS = sectionFiles.map(file => {
	const source = readFileSync(file, 'utf8')
	const call = /export const (\w+) = \/\* @__PURE__ \*\/ localized\('(\w+)', (\w+)\)/.exec(source)
	return { file, source, name: call?.[1], key: call?.[2], ruName: call?.[3] }
})

/** Вызовы, выполняемые при загрузке модуля: не внутри функций (их тело не исполняется) */
function topLevelCalls(file: string): string[] {
	const sourceFile = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
	const calls: string[] = []
	const visit = (node: ts.Node): void => {
		if (ts.isFunctionLike(node) || ts.isClassLike(node)) return
		if (ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isTaggedTemplateExpression(node))
			calls.push(node.getText(sourceFile).slice(0, 60))
		ts.forEachChild(node, visit)
	}
	for (const statement of sourceFile.statements) if (!ts.isImportDeclaration(statement)) visit(statement)
	return calls
}

describe('разделы словаря (sections/**)', () => {
	it('у каждого модуля один раздел: имя файла — ключ раздела, ключ есть в русском словаре', () => {
		for (const section of SECTIONS) {
			expect(section.key, section.file).toBeDefined()
			expect(section.file.endsWith(`/${section.key}.ts`) || section.file.endsWith(`\\${section.key}.ts`), section.file).toBe(true)
			expect(section.source.startsWith('/** '), `${section.file}: нет заголовка модуля`).toBe(true)
			expect(Object.keys(ru), section.file).toContain(section.key)
		}
	})

	it('каждый раздел русского словаря имеет модуль, а UI_* из messages.ts — модуль раздела', () => {
		const keys = SECTIONS.map(section => section.key).sort()
		const expected = Object.keys(ru)
			.filter(key => !NOT_SECTIONS.includes(key))
			.sort()
		expect(keys).toEqual(expected)

		const names = SECTIONS.map(section => section.name).sort()
		expect(Object.keys(messages).sort()).toEqual(names)
		expect(new Set(names).size).toBe(names.length)
	})

	it('раздел в messages.ts читает свой ключ языка', () => {
		for (const section of SECTIONS) {
			const value = (messages as unknown as Record<string, Record<string, string>>)[section.name!]
			expect(Object.keys(value), section.name).toEqual(Object.keys((ru as unknown as Record<string, object>)[section.key!]))
		}
	})

	it('messages.ts — только реэкспорт', () => {
		const source = readFileSync(resolve(LOCALES_DIR, 'messages.ts'), 'utf8')
		const code = source.replace(/\/\*[\s\S]*?\*\//g, '').trim()
		for (const line of code.split('\n')) expect(line).toMatch(/^export \{ UI_\w+|TABLE_\w+ \} from '\.\/sections\/[\w/]+'$/)
	})

	it('в sections/** нет вызовов при загрузке, кроме localized; в ru/** — никаких', () => {
		for (const section of SECTIONS) {
			expect(topLevelCalls(section.file), section.file).toEqual([`localized('${section.key}', ${section.ruName})`])
		}
		for (const file of ruFiles) expect(topLevelCalls(file), file).toEqual([])
	})
})

describe('группы чанков русского словаря (build.lib.ts)', () => {
	const groups = createRuLocaleGroups()
	const core = groups.find(group => group.name === 'locale-core')!
	const ruGroups = groups.filter(group => group !== core)

	it('locale-core: localized, current и legacyKeys, приоритет выше разделов', () => {
		for (const name of ['localized', 'current', 'legacyKeys']) expect(core.test(norm(resolve(LOCALES_DIR, `${name}.ts`)))).toBe(true)
		expect(core.test(norm(resolve(LOCALES_DIR, 'state.ts')))).toBe(false)
		for (const group of ruGroups) expect(core.priority).toBeGreaterThan(group.priority)
	})

	it('каждый раздел и его русский файл — ровно в одной группе locale-ru-*', () => {
		for (const section of SECTIONS) {
			const matched = ruGroups.filter(group => group.test(norm(section.file)))
			expect(
				matched.map(group => group.name),
				section.file,
			).toHaveLength(1)
			const ruImport = /from '(?:\.\.\/)+(ru\/[^']+)'/.exec(section.source)![1]
			expect(matched[0].name).toBe(`locale-${ruImport.replace(/\//g, '-')}`)
			expect(matched[0].test(norm(resolve(LOCALES_DIR, `${ruImport}.ts`)))).toBe(true)
		}
	})

	it('русский файл не остаётся без группы: каждый ru/**, на который ссылается раздел, имеет свою', () => {
		const used = new Set(SECTIONS.map(section => /from '(?:\.\.\/)+(ru\/[^']+)'/.exec(section.source)![1]))
		expect(ruGroups.map(group => group.name).sort()).toEqual([...used].map(path => `locale-${path.replace(/\//g, '-')}`).sort())
	})
})

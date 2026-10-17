/**
 * Готовит содержимое отдельного репозитория пакета: `node build/packages/extract.mjs <имя> <папка>`.
 * Пакеты (media, maps, editor) описаны в packages.json: папки компонентов кита, их место в `src/` пакета и входы.
 * Копирует компоненты без тестов и stories, переписывает импорты кита на публичные входы `@ramzes1385/rise-ui-kit`,
 * кладёт SCSS-помощники кита и шаблон проекта (общий `templates/common/` и свой `templates/<имя>/`).
 * Строки интерфейса (`@/locales/messages`, `/state`, `/warn` — внутренности кита) идут через `src/kitLocale.ts`:
 * он читает словарь кита публичным `useLocale()`, как плеер.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const BUILD = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(BUILD, '../..')
const COMPONENTS = join(ROOT, 'src/components')
const TEMPLATES = join(BUILD, 'templates')
const KIT = '@ramzes1385/rise-ui-kit'

const PACKAGES = JSON.parse(readFileSync(join(BUILD, 'packages.json'), 'utf8'))

const SKIPPED_DIRS = ['__tests__', 'stories']

const KIT_SCSS = ['_functions.scss', '_mixins.scss', '_variables.scss']

const LOCALE_MODULE = 'kitLocale'

const LOCALE_SPECIFIER = /^@\/locales\/(?:messages|state|warn)$/

const LOCALE_FIXED_NAMES = ['currentLocale', 'formatMessage', 'formatNumber', 'getLocale', 'pluralize', 'warn']

const KIT_ENTRIES = [
	[/^@components(?:\/.*)?$/, `${KIT}/components`],
	[/^@composables(?:\/.*)?$/, `${KIT}/composables`],
	[/^@utils(?:\/.*)?$/, `${KIT}/utils`],
	[/^@icons(?:\/.*)?$/, `${KIT}/icons`],
	[/^@\/locales(?:\/.*)?$/, KIT],
]

const INTERNAL = /^@(?:\/|styles\/)/

const SPECIFIER = /(\bfrom\s+|\bimport\s+|\bimport\(\s*)(['"])([^'"]+)\2/g

const EXTENSIONS = ['', '.ts', '.vue', '.scss', '/index.ts']

function packagePath(specifier, file, src, components) {
	const component = components.find(({ dir }) => specifier === `@components/${dir}` || specifier.startsWith(`@components/${dir}/`))
	if (!component) return null
	const rest = specifier.slice(`@components/${component.dir}`.length)
	const path = relative(dirname(file), join(src, component.to, rest)).replaceAll('\\', '/')
	return path.startsWith('.') ? path : `./${path}`
}

function exists(base) {
	return EXTENSIONS.some(extension => existsSync(base + extension) && (extension === '/index.ts' || statSync(base + extension).isFile()))
}

function relativeImport(from, to) {
	const path = relative(dirname(from), to).replaceAll('\\', '/')
	return path.startsWith('.') ? path : `./${path}`
}

function rewriteImports(source, file, target, components) {
	const src = join(target, 'src')
	return source.replace(SPECIFIER, (match, keyword, quote, specifier) => {
		const local = packagePath(specifier, file, src, components)
		if (local) return `${keyword}${quote}${local}${quote}`
		if (LOCALE_SPECIFIER.test(specifier)) return `${keyword}${quote}${relativeImport(file, join(src, LOCALE_MODULE))}${quote}`
		const entry = KIT_ENTRIES.find(([pattern]) => pattern.test(specifier))
		if (entry) return `${keyword}${quote}${entry[1]}${quote}`
		if (INTERNAL.test(specifier)) throw new Error(`${relative(target, file)}: импорт внутреннего модуля кита «${specifier}»`)
		if (specifier.startsWith('.') && !exists(resolve(dirname(file), specifier))) {
			throw new Error(`${relative(target, file)}: относительный импорт «${specifier}» выходит за папки пакета`)
		}
		return match
	})
}

function sourceFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return sourceFiles(path)
		return /\.(ts|vue)$/.test(entry.name) ? [path] : []
	})
}

function copyComponents(target, components) {
	const src = join(target, 'src')
	for (const { dir, to } of components) {
		cpSync(join(COMPONENTS, dir), join(src, to), {
			recursive: true,
			filter: path => !SKIPPED_DIRS.includes(path.split(/[\\/]/).pop()) || !statSync(path).isDirectory(),
		})
	}
}

function writeEntries(target, entries) {
	for (const [file, dirs] of Object.entries(entries)) {
		const header = `/** Вход пакета: ${file} (создан extract.mjs) */\n`
		writeFileSync(join(target, 'src', file), header + dirs.map(dir => `export * from './${dir}'`).join('\n') + '\n')
	}
}

/** Имена, которые файлы пакета берут из `@/locales/messages|state|warn` (до переписывания импортов) */
function usedLocaleNames(files) {
	const names = new Set()
	const pattern = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@\/locales\/(?:messages|state|warn)['"]/g
	for (const file of files) {
		for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
			match[1].split(',').forEach(
				part =>
					part.trim() &&
					names.add(
						part
							.trim()
							.replace(/^type\s+/, '')
							.split(/\s+as\s+/)[0],
					),
			)
		}
	}
	return [...names].sort()
}

/** Разделы словаря: `UI_MAP` → `map` — по `src/locales/messages.ts` кита (`localized('map', ruMap)`, с пометкой `@__PURE__` или без) */
function localeSections() {
	const source = readFileSync(join(ROOT, 'src/locales/messages.ts'), 'utf8')
	const pattern = /export const (\w+) = (?:\/\* @__PURE__ \*\/ )?localized\('(\w+)'[,)]/g
	return new Map([...source.matchAll(pattern)].map(match => [match[1], match[2]]))
}

function writeKitLocale(target, names) {
	if (names.length === 0) return
	const sections = localeSections()
	const unknown = names.filter(name => !sections.has(name) && !LOCALE_FIXED_NAMES.includes(name))
	if (unknown.length > 0) throw new Error(`Строки кита: нет в messages.ts и в наборе kitLocale: ${unknown.join(', ')}`)
	const sectionLines = names.filter(name => sections.has(name)).map(name => `export const ${name} = section('${sections.get(name)}')`)
	const body = `/** Строки интерфейса из словаря Rise UI Kit: разделы читаются публичным useLocale(), язык и defineLocale() — как у кита (создан extract.mjs) */
import type { UiKitLocale } from '${KIT}'
import { useLocale } from '${KIT}/composables'

const { messages, formatMessage, formatNumber, plural } = useLocale()

function section<K extends keyof UiKitLocale>(key: K): Readonly<UiKitLocale[K]> {
	const values = (): Record<string, string> => messages.value[key] as unknown as Record<string, string>
	return new Proxy({} as Readonly<UiKitLocale[K]>, {
		get: (_, name) => (typeof name === 'string' ? values()[name] : undefined),
		has: (_, name) => typeof name === 'string' && name in values(),
		ownKeys: () => Object.keys(values()),
		getOwnPropertyDescriptor: (_, name) =>
			typeof name === 'string' && name in values() ? { value: values()[name], enumerable: true, configurable: true } : undefined,
	})
}

${sectionLines.join('\n')}

export const pluralize = plural

export function getLocale(): UiKitLocale {
	return messages.value
}

/** Текущий словарь кита (\`.value.code\` — код языка), как \`currentLocale\` внутри кита */
export const currentLocale = messages

export function warn(message: string, params: Record<string, string | number> = {}): void {
	console.warn(\`[rise-ui-kit] \${formatMessage(message, params)}\`)
}

export { formatMessage, formatNumber }
`
	writeFileSync(join(target, 'src', `${LOCALE_MODULE}.ts`), body)
}

function copyKitScss(target) {
	const dir = join(target, 'src/styles/kit')
	mkdirSync(dir, { recursive: true })
	for (const name of KIT_SCSS) {
		const lines = readFileSync(join(ROOT, 'src/styles', name), 'utf8').split('\n')
		const body = lines.slice(lines.findIndex(line => !line.startsWith('//'))).filter(line => !/^@use '\.\/(tokens|motion)'/.test(line))
		const header = `// Копия src/styles/${name} из Rise UI Kit без токенов: переменные --rise-* приходят из styles.css кита`
		writeFileSync(join(dir, name), [header, ...body].join('\n'))
	}
}

const [name, folder] = process.argv.slice(2)
const config = PACKAGES[name]
if (!config || !folder) {
	console.error(`Использование: node build/packages/extract.mjs <${Object.keys(PACKAGES).join('|')}> <папка>`)
	process.exit(1)
}
const target = resolve(folder)
if (existsSync(target) && readdirSync(target).length > 0) {
	console.error(`Папка ${target} не пуста`)
	process.exit(1)
}
cpSync(join(TEMPLATES, 'common'), target, { recursive: true })
cpSync(join(TEMPLATES, name), target, { recursive: true })
copyComponents(target, config.components)
writeEntries(target, config.entries)
const files = sourceFiles(join(target, 'src'))
const localeNames = usedLocaleNames(files)
for (const file of files) {
	writeFileSync(file, rewriteImports(readFileSync(file, 'utf8'), file, target, config.components))
}
writeKitLocale(target, localeNames)
copyKitScss(target)
console.log(`Готово: ${config.name} в ${target}. Дальше — npm install и npm run build (см. README.md)`)

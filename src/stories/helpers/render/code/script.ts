/** Код для «Show code»: строки `script` и импорты из текста модуля, функция `setup` которого рисует превью. */

import type { ScriptImports, ScriptImportsExtra } from '../../types/helpers.types'

const SETUP_START = /^(?:export\s+)?function setup\(\)[^{]*\{\s*$/
const IMPORT_END = /(?:from\s+)?'[^']+'\s*$/

/** Импорты модуля: в «Show code» их собирает `storySource` по `imports`, `vue` и `importsFrom` */
function withoutImports(lines: readonly string[]): string[] {
	const result: string[] = []
	let isImport = false
	for (const line of lines) {
		if (line.startsWith('import ')) isImport = true
		if (!isImport) result.push(line.replace(/^export\s+/, ''))
		if (isImport && IMPORT_END.test(line)) isImport = false
	}
	return result
}

/** Тело `setup` без отступа функции и без итогового `return`: оно и есть верх `<script setup>` */
function unwrapSetup(lines: readonly string[]): string[] {
	const start = lines.findIndex(line => SETUP_START.test(line))
	if (start === -1) return [...lines]
	const end = lines.findIndex((line, index) => index > start && line === '}')
	const body = lines.slice(start + 1, end === -1 ? lines.length : end)
	const returnAt = body.findIndex(line => /^\treturn\b/.test(line))
	const statements = (returnAt === -1 ? body : body.slice(0, returnAt)).map(line => line.replace(/^\t/, ''))
	return [...lines.slice(0, start), ...statements, ...(end === -1 ? [] : lines.slice(end + 1))]
}

/**
 * Строки `script` для `storySource` из текста модуля (`import raw from './X.setup.ts?raw'`): без импортов
 * и `export`, тело `function setup()` — на верхнем уровне, без `return`. Превью вызывает ту же `setup`,
 * поэтому код не расходится с примером: функция написана один раз, с типами, как в приложении.
 *
 * @example
 * import { setup } from './SignIn.setup'
 * import setupSource from './SignIn.setup.ts?raw'
 * source: staticStorySource({ template, imports: ['BaseForm'], vue: ['ref'], script: scriptSource(setupSource) })
 * render: args => ({ setup: useStorySetup(args, { setup }), template })
 */
export function scriptSource(raw: string): string {
	const lines = unwrapSetup(withoutImports(raw.replace(/\r\n/g, '\n').split('\n')))
	return lines
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

const KIT_PACKAGE = '@ramzes1385/rise-ui-kit'
const IMPORT_STATEMENT = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/gm

/** Откуда в «Show code» берётся модуль: пакет кита (`imports`), его подпуть, относительный файл */
function importTarget(specifier: string): string {
	if (specifier.startsWith('@utils/')) return `${KIT_PACKAGE}/utils`
	if (specifier.startsWith('@composables/')) return `${KIT_PACKAGE}/composables`
	if (specifier === '@components/BaseMediaPlayer') return `${KIT_PACKAGE}/media`
	if (specifier.startsWith('@components/')) return KIT_PACKAGE
	if (specifier.startsWith('../')) return specifier.slice(1)
	throw new Error(`scriptImports: неизвестный путь импорта '${specifier}'`)
}

function addNames(target: Record<string, string[]>, from: string, names: readonly string[]): void {
	target[from] = [...new Set([...(target[from] ?? []), ...names])]
}

/**
 * Импорты кита и соседних файлов из текста модуля (`?raw`) для `imports` и `importsFrom` у `storySource`:
 * `@components/…` — пакет кита, `@utils/…`, `@composables/…` и `BaseMediaPlayer` — подпуть пакета, `../x` — `./x`;
 * `vue` — имена из `vue` (значение `vue` у `storySource`). `extra` — то, чего в модуле нет (компоненты из шаблона).
 *
 * @example
 * const kit = scriptImports(setupSource, { imports: ['BaseButton'] })
 * source: staticStorySource({ template, imports: kit.imports, importsFrom: kit.importsFrom, script: scriptSource(setupSource) })
 */
export function scriptImports(raw: string, extra: ScriptImportsExtra = {}): ScriptImports {
	const target: Record<string, string[]> = {
		...Object.fromEntries(Object.entries(extra.importsFrom ?? {}).map(([from, names]) => [from, [...names]])),
	}
	const vue = [...(extra.vue ?? [])]
	const own = [...raw.replace(/\r\n/g, '\n').matchAll(IMPORT_STATEMENT)]
	for (const [, type, list, specifier] of own) {
		const names = list
			.split(',')
			.map(name => name.trim())
			.filter(Boolean)
		if (specifier === 'vue') {
			vue.push(...names)
			continue
		}
		addNames(
			target,
			importTarget(specifier),
			names.map(name => (type && !name.startsWith('type ') ? `type ${name}` : name)),
		)
	}
	const imports = [...new Set([...(extra.imports ?? []), ...(target[KIT_PACKAGE] ?? [])])]
	delete target[KIT_PACKAGE]
	return { imports, vue: [...new Set(vue)].sort(), importsFrom: target }
}

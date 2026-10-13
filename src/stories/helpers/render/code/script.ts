/** Код для «Show code»: строки `script` из текста модуля, функция `setup` которого рисует превью. */

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

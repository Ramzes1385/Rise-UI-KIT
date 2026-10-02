/** Храповики и бюджет размера: scripts/check-ratchets.mjs на временном репозитории. */

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const SCRIPT = resolve(import.meta.dirname, '../../scripts/check-ratchets.mjs')

const PACKAGE = {
	exports: {
		'.': { types: './dist/index.d.ts', import: './dist/index.js' },
		'./styles.css': { types: './dist/styles.d.ts', import: './dist/styles.css', default: './dist/styles.css' },
		'./package.json': './package.json',
	},
	scripts: {
		'test:components:coverage': 'vitest run --coverage --coverage.exclude=src/A.vue --coverage.exclude=src/B.vue',
		'test:utils:coverage': 'vitest run --coverage',
		'test:a11y:coverage': 'node scripts/check-a11y-coverage.mjs',
	},
}

const BASE = {
	size: { 'index.js': { gzip: 0, budget: 4096 }, 'styles.css': { gzip: 0, budget: 4096 } },
	coverageExcludes: { 'test:components:coverage': 2, 'test:utils:coverage': 0 },
	lintWarnings: 3,
}

const lintReport = (warnings: number) => [
	{ filePath: 'src/a.ts', warningCount: warnings, errorCount: 0 },
	{ filePath: 'src/b.ts', warningCount: 0, errorCount: 0 },
]

let root = ''

const write = (file: string, content: unknown) => {
	writeFileSync(join(root, file), typeof content === 'string' ? content : JSON.stringify(content, null, '\t'))
}

const readBase = () => JSON.parse(readFileSync(join(root, 'build/ratchets.json'), 'utf8'))

function run(...flags: string[]) {
	const result = spawnSync(process.execPath, [SCRIPT, `--root=${root}`, `--lint-report=${join(root, 'eslint.json')}`, ...flags], {
		encoding: 'utf8',
	})
	return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

/** Детерминированный «несжимаемый» текст: gzip почти не уменьшает его */
function noise(bytes: number) {
	let seed = 7
	let text = ''
	while (text.length < bytes) {
		seed = (seed * 48271) % 2147483647
		text += seed.toString(36)
	}
	return text.slice(0, bytes)
}

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), 'ratchets-'))
	mkdirSync(join(root, 'build'))
	mkdirSync(join(root, 'dist/chunks'), { recursive: true })
	write('package.json', PACKAGE)
	write('build/ratchets.json', BASE)
	write('eslint.json', lintReport(3))
	write('dist/index.js', 'import { a } from "./chunks/a-1.js"\nexport { a }\nexport const lazy = () => import("./chunks/lazy-1.js")\n')
	write('dist/chunks/a-1.js', 'export const a = 1\n')
	write('dist/chunks/lazy-1.js', `export const lazy = "${noise(8000)}"\n`)
	write('dist/styles.css', '.a { color: red }\n')
})

afterEach(() => {
	rmSync(root, { recursive: true, force: true })
})

describe('check-ratchets', () => {
	it('зелёный, когда числа равны базе и размер в бюджете; динамический import() не входит в размер', () => {
		const { status, output } = run()

		expect(status).toBe(0)
		expect(output).toContain('Храповики пройдены')
		expect(output).toContain('test:components:coverage: 2 ≤ база 2')
		expect(output).not.toContain('test:a11y:coverage')
	})

	it('лишнее исключение покрытия роняет проверку', () => {
		write('package.json', {
			...PACKAGE,
			scripts: { ...PACKAGE.scripts, 'test:utils:coverage': 'vitest run --coverage --coverage.exclude=src/utils/x.ts' },
		})

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('test:utils:coverage: 1, база 0')
	})

	it('исключение в новом скрипте покрытия без базы считается от нуля', () => {
		write('package.json', {
			...PACKAGE,
			scripts: { ...PACKAGE.scripts, 'test:new:coverage': 'vitest run --coverage --coverage.exclude src/x.ts' },
		})

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('test:new:coverage: 1, база 0')
	})

	it('лишнее предупреждение lint роняет проверку', () => {
		write('eslint.json', lintReport(4))

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('предупреждений: 4, база 3')
	})

	it('размер входа со статически подгружаемым чанком больше бюджета роняет проверку', () => {
		write('dist/chunks/a-1.js', `export const a = "${noise(8000)}"\n`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toMatch(/размер: index\.js — [\d.]+ КБ gzip, бюджет 4\.0 КБ/)
	})

	it('вход без бюджета и отсутствующий dist роняют проверку', () => {
		write('build/ratchets.json', { ...BASE, size: { 'index.js': BASE.size['index.js'] } })

		expect(run().output).toContain('у входа styles.css нет бюджета')

		rmSync(join(root, 'dist'), { recursive: true })
		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('нет dist/')
	})

	it('без флагов база не меняется', () => {
		write('eslint.json', lintReport(1))

		expect(run().status).toBe(0)
		expect(readBase()).toEqual(BASE)
	})

	it('--update опускает базу покрытия и lint, но не поднимает её и не трогает бюджет размера', () => {
		write('package.json', { ...PACKAGE, scripts: { ...PACKAGE.scripts, 'test:components:coverage': 'vitest run --coverage' } })
		write('eslint.json', lintReport(1))

		const { status, output } = run('--update')

		expect(status).toBe(0)
		expect(output).toContain('база опущена до 0')
		expect(readBase()).toEqual({
			...BASE,
			coverageExcludes: { 'test:components:coverage': 0, 'test:utils:coverage': 0 },
			lintWarnings: 1,
		})

		write('eslint.json', lintReport(2))

		expect(run('--update').status).toBe(1)
		expect(readBase().lintWarnings).toBe(1)
	})

	it('--reset-size-budget записывает бюджет: текущий размер + запас, не меньше 1 КБ', () => {
		const { status } = run('--reset-size-budget')
		const { size } = readBase()

		expect(status).toBe(0)
		expect(size['index.js'].gzip).toBeGreaterThan(0)
		expect(size['index.js'].budget).toBeGreaterThanOrEqual(size['index.js'].gzip + 1024)
		expect(size['index.js'].budget % 1024).toBe(0)
	})
})

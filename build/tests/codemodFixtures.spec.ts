/** Кодмод `rise-ui-kit migrate`: приложение 1.x из build/tests/codemod-fixtures → ожидаемый результат, идемпотентность, предупреждения, CLI. */

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HELP, listFiles, main, parseArgs, vueVersionWarning } from '../../bin/migrate/cli.mjs'
import { MIGRATION_URL, SECTION, slugify } from '../../bin/migrate/rules.mjs'
import { collectFacts, mergeFacts, transformFile } from '../../bin/migrate/transform.mjs'

const ROOT = resolve(import.meta.dirname, '../..')
const FIXTURES = join(ROOT, 'build/tests/codemod-fixtures')
const BIN = join(ROOT, 'bin/rise-migrate.mjs')

/** Файлы фикстур лежат с суффиксом `.fixture`, чтобы линтеры и tsc не принимали их за код кита. */
function materialize(kind: 'input' | 'expected', dest: string): string[] {
	const base = join(FIXTURES, kind)
	const copied: string[] = []
	const walk = (dir: string) => {
		for (const name of readdirSync(dir)) {
			const full = join(dir, name)
			if (statSync(full).isDirectory()) {
				walk(full)
				continue
			}
			const rel = full.slice(base.length + 1).replace(/\.fixture$/, '')
			mkdirSync(dirname(join(dest, rel)), { recursive: true })
			writeFileSync(join(dest, rel), readFileSync(full, 'utf8'))
			copied.push(rel)
		}
	}
	walk(base)
	return copied.sort()
}

function run(dir: string, args: string[] = []) {
	let stdout = ''
	let stderr = ''
	const code = main(args, {
		cwd: dir,
		stdout: { write: (chunk: string) => ((stdout += chunk), true) },
		stderr: { write: (chunk: string) => ((stderr += chunk), true) },
	} as never)
	return { code, stdout, stderr }
}

function snapshot(dir: string): Record<string, string> {
	return Object.fromEntries(listFiles(dir).map(file => [file, readFileSync(join(dir, file), 'utf8')]))
}

let work: string
beforeEach(() => {
	work = mkdtempSync(join(tmpdir(), 'rise-migrate-'))
})
afterEach(() => {
	rmSync(work, { recursive: true, force: true })
})

describe('приложение 1.x из фикстур', () => {
	it('по умолчанию (--dry) показывает diff и не меняет файлы', () => {
		materialize('input', work)
		const before = snapshot(work)
		const { code, stdout } = run(work, ['migrate', '.'])
		expect(code).toBe(0)
		expect(snapshot(work)).toEqual(before)
		expect(stdout).toContain('режим --dry')
		expect(stdout).toContain('--- a/src/main.ts')
		expect(stdout).toContain("+import '@ramzes1385/rise-ui-kit/media.css'")
		expect(stdout).toContain('Применить правки: npx @ramzes1385/rise-ui-kit migrate . --write')
	})

	it('--write даёт ожидаемый результат, повторный запуск ничего не меняет', () => {
		materialize('input', work)
		const first = run(work, ['migrate', work, '--write'])
		expect(first.code).toBe(0)
		expect(first.stdout).toContain('изменён: src/main.ts')

		const expectedDir = mkdtempSync(join(tmpdir(), 'rise-migrate-expected-'))
		try {
			materialize('expected', expectedDir)
			expect(snapshot(work)).toEqual(snapshot(expectedDir))
		} finally {
			rmSync(expectedDir, { recursive: true, force: true })
		}

		const afterFirst = snapshot(work)
		const second = run(work, ['--write'])
		expect(second.stdout).toContain('Механических правок нет.')
		expect(second.stdout).toContain('изменено 0 (правок: 0)')
		expect(snapshot(work)).toEqual(afterFirst)
	})

	it('результат — уже «чистый» вход: на ожидаемых файлах правок нет', () => {
		materialize('expected', work)
		const { stdout } = run(work)
		expect(stdout).toContain('Механических правок нет.')
	})

	it('предупреждения категории (б): место, код и раздел MIGRATION', () => {
		materialize('input', work)
		const files = listFiles(work)
		const texts = new Map(files.map(f => [f, readFileSync(join(work, f), 'utf8')]))
		const ctx = mergeFacts(files.map(file => ({ file, facts: collectFacts(file, texts.get(file) as string) })))
		const found = files.flatMap(file =>
			transformFile(file, texts.get(file) as string, ctx).warnings.map(
				(w: { line: number; id: string }) => `${file}:${w.line}:${w.id}`,
			),
		)
		expect(found).toEqual([
			'src/Own.vue:12:class-conflict',
			'src/Own.vue:15:class-conflict',
			'src/Warnings.vue:2:modal-confirm',
			'src/Warnings.vue:3:calendar-events',
			'src/Warnings.vue:4:calendar-slots',
			'src/Warnings.vue:5:calendar-slots',
			'src/Warnings.vue:7:default-slot',
			'src/Warnings.vue:8:default-slot',
			'src/Warnings.vue:9:mega-props',
			'src/Warnings.vue:9:mega-events',
			'src/Warnings.vue:10:mega-slots',
			'src/Warnings.vue:12:router-push',
			'src/Warnings.vue:13:formfield-for',
			'src/Warnings.vue:14:input-attrs',
			'src/Warnings.vue:16:chat-avatar',
			'src/Warnings.vue:16:chat-members',
			'src/Warnings.vue:17:text-weight',
			'src/Warnings.vue:19:aria-group',
			'src/Warnings.vue:20:player-global',
			'src/Warnings.vue:21:router-push',
			'src/composables/legacy.ts:2:removed-export',
			'src/composables/legacy.ts:3:removed-export',
			'src/composables/legacy.ts:3:removed-export',
			'src/composables/legacy.ts:3:removed-export',
			'src/composables/legacy.ts:4:changed-export',
			'src/composables/legacy.ts:4:removed-export',
			'src/composables/legacy.ts:7:locale-key',
			'src/composables/legacy.ts:8:locale-key',
			'src/composables/legacy.ts:12:tabs-icon-html',
			'src/composables/legacy.ts:16:upload-pending',
			'src/composables/legacy.ts:17:upload-preview',
			'src/styles/app.scss:12:class-conflict',
			'src/styles/app.scss:38:tooltip-class',
			'src/styles/app.scss:43:css-token',
			'src/styles/app.scss:44:css-token',
			'src/styles/app.scss:45:alias-token',
			'src/styles/app.scss:47:css-token',
			'src/styles/app.scss:48:css-token',
			'src/styles/app.scss:49:css-token',
			'src/styles/app.scss:52:css-selector',
			'src/styles/app.scss:55:css-selector',
			'src/styles/app.scss:58:css-selector',
			'src/styles/app.scss:61:css-selector',
		])
	})

	it('в отчёте у каждого предупреждения есть ссылка на раздел MIGRATION и предупреждение о Vue из package.json', () => {
		materialize('input', work)
		const { stdout } = run(work)
		expect(stdout).toContain('package.json:6  vue ^3.4.21')
		expect(stdout).toContain(`${MIGRATION_URL}#порядок-перехода`)
		const warnings = stdout.split('\n').filter(line => /^ {2}\S+:\d+ {2}/.test(line))
		const links = stdout.split('\n').filter(line => line.includes('→ MIGRATION'))
		expect(warnings.length).toBeGreaterThan(30)
		expect(links).toHaveLength(warnings.length)
		expect(stdout).toContain('предупреждений: ')
	})

	it('ловушки: похожие имена, строки, комментарии и чужие компоненты не меняются', () => {
		materialize('input', work)
		run(work, ['--write'])
		const read = (rel: string) => readFileSync(join(work, rel), 'utf8')
		expect(read('src/main.ts')).toContain("// import { plugins } from '@ramzes1385/rise-ui-kit' — в комментарии")
		expect(read('src/main.ts')).toContain(`const note = "from '@ramzes1385/rise-ui-kit/plugins'"`)
		expect(read('src/utils/layout.ts')).toContain("export const note = 'calcTotalColumns(1, true, true, true)'")
		expect(read('src/utils/layout.ts')).toContain('`calcTotalColumns(${total}, true, false, false)`')
		expect(read('src/utils/foreign.ts')).toContain('calcTotalColumns(1, true, false, true)')
		expect(read('src/other.ts')).toContain("motion: 'default'")
		expect(read('src/theme.ts')).toContain(`"motion: 'default'"`)
		expect(read('src/Own.vue')).toContain('<BaseAnimation variant="mine" color="red" />')
		expect(read('src/Anim.vue')).toContain('<OwnBadge variant="soft" color="red" />')
		expect(read('src/Anim.vue')).toContain('<!-- <BaseAnimation variant="soft"> в комментарии остаётся как есть -->')
		expect(read('src/Anim.vue')).toContain('variant="trap" и color="trap" в тексте не трогаем')
		const scss = read('src/styles/app.scss')
		expect(scss).toContain('.my-zoom-enter-active')
		expect(scss).toContain('.rotate-enter-active-custom')
		expect(scss).toContain('/* .bounce-enter-active { opacity: 0 } */')
		expect(scss).toContain("content: '.flip-enter-active'")
		expect(scss).toContain('--color-brand: #123456')
		expect(scss).toContain('url(//cdn.example.com/bg.png); // комментарий после url')
	})
})

describe('медиа-стили плеера', () => {
	it('media.css добавляется один раз — в первый файл с импортом styles', () => {
		materialize('input', work)
		run(work, ['--write'])
		const all = snapshot(work)
		const withMedia = Object.entries(all).filter(([, text]) => text.includes('media.css'))
		expect(withMedia.map(([file]) => file)).toEqual(['src/main.ts'])
		expect(all['src/styles/main.css']).not.toContain('media.layer.css')
	})

	it('в CSS со слоями добавляется media.layer.css после styles.layer.css', () => {
		writeFileSync(
			join(work, 'main.css'),
			"@import url('@ramzes1385/rise-ui-kit/styles.layer.css') layer(rise);\n@import './base.css';\n",
		)
		writeFileSync(
			join(work, 'Player.vue'),
			`<script setup>\nimport { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'\n</script>\n`,
		)
		run(work, ['--write'])
		expect(readFileSync(join(work, 'main.css'), 'utf8')).toBe(
			"@import url('@ramzes1385/rise-ui-kit/styles.layer.css') layer(rise);\n@import '@ramzes1385/rise-ui-kit/media.layer.css';\n@import './base.css';\n",
		)
	})

	it('стили подключены в блоке <style> .vue — media.css добавляется туда', () => {
		writeFileSync(
			join(work, 'App.vue'),
			`<template><BaseMediaPlayer /></template>\n<script setup>\nimport { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'\n</script>\n<style lang="scss">\n@use '@ramzes1385/rise-ui-kit/styles.css';\n</style>\n`,
		)
		run(work, ['--write'])
		expect(readFileSync(join(work, 'App.vue'), 'utf8')).toContain(
			"@use '@ramzes1385/rise-ui-kit/styles.css';\n@import '@ramzes1385/rise-ui-kit/media.css';",
		)
	})

	it('media.css уже подключён — ничего не добавляется', () => {
		writeFileSync(
			join(work, 'main.ts'),
			`import '@ramzes1385/rise-ui-kit/styles'\nimport '@ramzes1385/rise-ui-kit/media.css'\nimport { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'\nconsole.log(BaseMediaPlayer)\n`,
		)
		const { stdout } = run(work)
		expect(stdout).toContain('Механических правок нет.')
	})

	it('нет импорта styles — предупреждение один раз, без правок', () => {
		writeFileSync(
			join(work, 'Player.ts'),
			`import { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'\nconsole.log(BaseMediaPlayer)\n`,
		)
		const { stdout } = run(work)
		expect(stdout).toContain('Player.ts:1  плеер найден, но импорта @ramzes1385/rise-ui-kit/styles')
		expect(stdout).toContain('Механических правок нет.')
	})

	it('без плеера media.css не нужен', () => {
		writeFileSync(join(work, 'main.ts'), `import '@ramzes1385/rise-ui-kit/styles'\n`)
		expect(run(work).stdout).toContain('Механических правок нет.')
	})
})

describe('командная строка', () => {
	it('параметры: --help, ошибки, папка по умолчанию', () => {
		expect(parseArgs([])).toEqual({ dir: '.', write: false, help: false, error: null })
		expect(parseArgs(['app', '--write'])).toMatchObject({ dir: 'app', write: true })
		expect(parseArgs(['--dry'])).toMatchObject({ write: false, error: null })
		expect(parseArgs(['--dry', '--write']).error).toContain('взаимоисключающие')
		expect(parseArgs(['--bogus']).error).toContain('Неизвестный параметр: --bogus')
		expect(parseArgs(['a', 'b']).error).toContain('Лишний аргумент: b')
		expect(parseArgs(['-h']).help).toBe(true)

		const help = run(work, ['migrate', '--help'])
		expect(help.code).toBe(0)
		expect(help.stdout).toContain(HELP)

		const bad = run(work, ['--bogus'])
		expect(bad.code).toBe(2)
		expect(bad.stderr).toContain('Неизвестный параметр')

		const missing = run(work, ['no-such-dir'])
		expect(missing.code).toBe(2)
		expect(missing.stderr).toContain('Папка не найдена')

		writeFileSync(join(work, 'file.txt'), '')
		expect(run(work, ['file.txt']).code).toBe(2)

		const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
		try {
			expect(main(['--help'])).toBe(0)
			expect(spy).toHaveBeenCalledWith(`${HELP}\n`)
		} finally {
			spy.mockRestore()
		}
	})

	it('обходит папки, пропуская node_modules, dist и .d.ts', () => {
		for (const dir of ['src', 'node_modules/pkg', 'dist', '.git']) mkdirSync(join(work, dir), { recursive: true })
		for (const file of ['src/a.ts', 'src/b.vue', 'src/types.d.ts', 'src/c.txt', 'node_modules/pkg/x.ts', 'dist/y.ts', '.git/z.ts'])
			writeFileSync(join(work, file), '')
		expect(listFiles(work)).toEqual(['src/a.ts', 'src/b.vue'])
	})

	it('vue < 3.5 в package.json — предупреждение; 3.5+, не 3.x и отсутствие — нет', () => {
		const write = (version: string | undefined) =>
			writeFileSync(join(work, 'package.json'), JSON.stringify({ devDependencies: version ? { vue: version } : {} }, null, '\t'))
		write('~3.4.0')
		expect(vueVersionWarning(work)).toMatchObject({ file: 'package.json', text: expect.stringContaining('vue ~3.4.0') })
		write('^3.5.0')
		expect(vueVersionWarning(work)).toBeNull()
		write('^4.0.0')
		expect(vueVersionWarning(work)).toBeNull()
		write('latest')
		expect(vueVersionWarning(work)).toBeNull()
		write(undefined)
		expect(vueVersionWarning(work)).toBeNull()
		write('^2.7.0')
		expect(vueVersionWarning(work)?.line).toBeGreaterThan(0)
	})

	it('package.json ищется выше папки, а если его нет — предупреждения нет', () => {
		const sub = join(work, 'packages/app/src')
		mkdirSync(sub, { recursive: true })
		writeFileSync(join(work, 'package.json'), JSON.stringify({ dependencies: { vue: '^3.3.0' } }))
		expect(vueVersionWarning(sub)?.file).toBe('../../../package.json')
		rmSync(join(work, 'package.json'))
		expect(vueVersionWarning(sub)).toBeNull()
	})

	it('bin: npx-вход печатает справку и выходит с кодом 0', () => {
		const out = execFileSync('node', [BIN, 'migrate', '--help'], { encoding: 'utf8' })
		expect(out).toContain('Использование: npx @ramzes1385/rise-ui-kit migrate')
		expect(() => execFileSync('node', [BIN, 'migrate', '--nope'], { stdio: 'pipe' })).toThrow()
	})

	it('package.json кита: есть bin и каталог bin в files', () => {
		const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
		expect(pkg.bin).toEqual({ 'rise-ui-kit': 'bin/rise-migrate.mjs' })
		expect(pkg.files).toContain('bin')
		expect(statSync(BIN).mode & 0o111).not.toBe(0)
	})
})

describe('ссылки на MIGRATION', () => {
	it('каждый раздел из таблицы правил — существующий заголовок docs/v2/MIGRATION.md', () => {
		const headings = readFileSync(join(ROOT, 'docs/v2/MIGRATION.md'), 'utf8')
			.split('\n')
			.filter(line => /^#{1,3} /.test(line))
			.map(line => line.replace(/^#+ /, '').replaceAll('`', ''))
		for (const title of Object.values(SECTION) as string[]) expect(headings, title).toContain(title)
		expect(slugify('Утилиты: объект вместо длинного списка параметров (порция С.5)')).toBe(
			'утилиты-объект-вместо-длинного-списка-параметров-порция-с5',
		)
	})
})

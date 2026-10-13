/** Храповик размера папок: scripts/check-folder-size.mjs на временном репозитории. */

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const SCRIPT = resolve(import.meta.dirname, '../../scripts/check-folder-size.mjs')

let root = ''

function fill(dir: string, count: number) {
	mkdirSync(join(root, dir), { recursive: true })
	for (let index = 0; index < count; index++) writeFileSync(join(root, dir, `file${index}.ts`), '')
}

function run() {
	const result = spawnSync(process.execPath, [SCRIPT, `--root=${root}`], { encoding: 'utf8' })
	return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

describe('check-folder-size', () => {
	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'folder-size-'))
	})

	afterEach(() => {
		rmSync(root, { recursive: true, force: true })
	})

	it('проходит, если в каждой папке не больше 7 файлов', () => {
		fill('src/components/BaseA', 7)
		fill('src/components/BaseA/ui', 3)
		const { status, output } = run()
		expect(status).toBe(0)
		expect(output).toContain('✅')
	})

	it('падает и называет папку с 8 файлами', () => {
		fill('src/components/BaseA/stories/cases', 8)
		const { status, output } = run()
		expect(status).toBe(1)
		expect(output).toContain('8  src/components/BaseA/stories/cases')
	})

	it('считает файлы только прямо в папке, вложенные папки — отдельно', () => {
		fill('src/utils', 5)
		fill('src/utils/a', 5)
		fill('src/utils/b', 5)
		expect(run().status).toBe(0)
	})

	it('выводит нарушения от большего к меньшему', () => {
		fill('src/a', 8)
		fill('src/b', 10)
		const { output } = run()
		expect(output.indexOf('src/b')).toBeLessThan(output.indexOf('src/a'))
	})

	it('пропускает исключение src/icons/svg', () => {
		fill('src/icons/svg', 20)
		expect(run().status).toBe(0)
	})

	it('не пропускает другие папки с именем svg', () => {
		fill('src/components/BaseA/svg', 9)
		expect(run().status).toBe(1)
	})
})

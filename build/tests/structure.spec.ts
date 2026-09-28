/**
 * Структура исходников: типы — только в папках types/.
 */

import { readdirSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function listFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
		entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
	)
}

describe('структура src', () => {
	it('файлы *.types.ts лежат в папках types/', () => {
		const misplaced = listFiles(join(ROOT, 'src'))
			.filter(file => file.endsWith('.types.ts') && basename(dirname(file)) !== 'types')
			.map(file => relative(ROOT, file))

		expect(misplaced).toEqual([])
	})
})

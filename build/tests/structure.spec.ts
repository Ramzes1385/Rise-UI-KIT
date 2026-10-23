/**
 * Структура исходников: типы — только в папках types/ (в том числе в их подпапках по назначению).
 */

import { readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function listFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
		entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
	)
}

describe('структура src', () => {
	it('файлы *.types.ts лежат в папках types/ или в их подпапках', () => {
		const misplaced = listFiles(join(ROOT, 'src'))
			.map(file => relative(ROOT, file))
			.filter(file => file.endsWith('.types.ts') && !dirname(file).split(sep).includes('types'))

		expect(misplaced).toEqual([])
	})
})

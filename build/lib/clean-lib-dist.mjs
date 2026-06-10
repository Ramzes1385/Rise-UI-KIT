import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const paths = [
	'dist/api',
	'dist/favicon.svg',
	'dist/favicon.svg.gz',
	'dist/favicon.svg.br',
	'dist/App.vue.d.ts',
	'dist/main.d.ts',
	'dist/playground',
	'dist/utils/storybookUtils',
]

for (const path of paths) {
	await rm(path, { recursive: true, force: true })
}

const compressedExtensions = ['.gz', '.br']

async function removeCompressedFiles(dir) {
	let entries = []

	try {
		entries = await readdir(dir, { withFileTypes: true })
	} catch {
		return
	}

	for (const entry of entries) {
		const fullPath = join(dir, entry.name)

		if (entry.isDirectory()) {
			await removeCompressedFiles(fullPath)
			continue
		}

		if (compressedExtensions.some(ext => entry.name.endsWith(ext))) {
			await rm(fullPath, { force: true })
		}
	}
}

await removeCompressedFiles('dist')
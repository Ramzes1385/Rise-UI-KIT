import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'
import { resolve, relative, dirname } from 'node:path'

const DIST = resolve(process.cwd(), 'dist')

const aliases = [
	{ prefix: '@components/', target: 'dist/components/' },
	{ prefix: '@composables/', target: 'dist/composables/' },
	{ prefix: '@utils/', target: 'dist/utils/' },
	{ prefix: '@icons/', target: 'dist/icons/' },
	{ prefix: '@plugins/', target: 'dist/plugins/' },
	{ prefix: '@constants', target: 'dist/constants/index' },
	{ prefix: '@constants/', target: 'dist/constants/' },
	{ prefix: '@/', target: 'dist/' },
]

function toRelative(from, to) {
	let rel = relative(from, to).replaceAll('\\', '/')
	if (!rel.startsWith('.')) {
		rel = './' + rel
	}
	return rel
}

const files = []
for await (const entry of glob('**/*.d.ts', { cwd: DIST })) {
	files.push(resolve(DIST, entry))
}

const styleImportRe = /^import\s+['"][^'"]*\.(?:scss|css|sass)['"];?\s*$/gm

let fixedCount = 0

for (const filePath of files) {
	let content = await readFile(filePath, 'utf-8')
	let modified = false
	const fileDir = dirname(filePath)

	for (const { prefix, target } of aliases) {
		const regex = new RegExp(`(from\\s+['"]|import\\s*\\(\\s*['"])${escapeRegex(prefix)}([^'"]+)(['"])`, 'g')

		content = content.replace(regex, (match, pre, modulePath, quote) => {
			const absTarget = resolve(process.cwd(), target, modulePath)
			modified = true
			return `${pre}${toRelative(fileDir, absTarget)}${quote}`
		})

		const typeImportInline = new RegExp(
			`(import\\s*\\(\\s*['"])${escapeRegex(prefix)}([^'"]+)(['"]\\s*\\))`,
			'g'
		)

		content = content.replace(typeImportInline, (match, pre, modulePath, post) => {
			const absTarget = resolve(process.cwd(), target, modulePath)
			modified = true
			return `${pre}${toRelative(fileDir, absTarget)}${post}`
		})
	}

	const stripped = content.replace(styleImportRe, '')
	if (stripped !== content) {
		content = stripped
		modified = true
	}

	if (modified) {
		await writeFile(filePath, content, 'utf-8')
		fixedCount++
	}
}

console.log(`Fixed aliases in ${fixedCount} of ${files.length} .d.ts files`)

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

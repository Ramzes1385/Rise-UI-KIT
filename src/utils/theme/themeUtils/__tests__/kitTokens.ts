import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const TOKENS_SCSS = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../styles/_tokens.scss'), 'utf-8')

export function scssPalettes(): Record<string, Record<string, string>> {
	const block = TOKENS_SCSS.slice(TOKENS_SCSS.indexOf('$palettes'), TOKENS_SCSS.indexOf('$roles'))
	const result: Record<string, Record<string, string>> = {}
	for (const [, role, body] of block.matchAll(/'(\w+)': \(\n([\s\S]*?)\n\t\)/g)) {
		result[role] = Object.fromEntries([...body.matchAll(/(\d+): (#[0-9a-f]+)/g)].map(([, shade, color]) => [shade, color]))
	}
	return result
}

function scssMixin(name: string): string {
	const start = TOKENS_SCSS.indexOf(`@mixin ${name}`)
	return TOKENS_SCSS.slice(start, TOKENS_SCSS.indexOf('\n}\n', start))
}

export function scssValue(mixin: string, token: string): string | undefined {
	return Array.from(scssMixin(mixin).matchAll(new RegExp(`${token}: ([^;]+);`, 'g')), match => match[1])[0]
}

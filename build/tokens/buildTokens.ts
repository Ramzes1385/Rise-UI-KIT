/// <reference types="node" />

/**
 * Экспорт токенов кита в формате W3C Design Tokens: базовый `tokens.json` и по файлу на тему и режим (`tokens/<тема>.<режим>.json`).
 * Значения считаются так же, как их считает браузер на одном элементе с `data-theme` и `data-rise-theme`: палитры и статика из
 * `_tokens.scss`, поверх них литералы темы (`createTheme(...).vars`, а в тёмном режиме и `darkVars`), семантика режима и производные.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { resolveValue } from './cssValue.ts'
import { convertValue, describeToken } from './tokenMap.ts'
import type { CssEnv } from './cssValue.ts'
import type { DesignToken, TokenDeclarations, TokenDocument, TokenFile, TokenGroup, TokenMode, TokenThemeSource } from './types.ts'

const EXTENSION_KEY = 'rise-ui-kit'
const ALIAS = /^var\((--rise-[\w-]+)\)$/
const BASE_FILE = 'tokens.json'

/** Окружение переменных элемента: `:root`, светлая семантика, тёмная поверх неё, производные, затем литералы темы */
function createEnv(declarations: TokenDeclarations, mode: TokenMode, theme: TokenThemeSource | null): Map<string, string> {
	const env = new Map([...declarations.base, ...declarations.light])
	if (mode === 'dark') for (const [name, value] of declarations.dark) env.set(name, value)
	for (const [name, value] of declarations.derived) env.set(name, value)
	for (const [name, value] of Object.entries(theme?.vars ?? {})) env.set(name, value)
	if (mode === 'dark') for (const [name, value] of Object.entries(theme?.darkVars ?? {})) env.set(name, value)
	return env
}

function tokenNames(declarations: TokenDeclarations): string[] {
	return [
		...new Set([
			...declarations.base.keys(),
			...declarations.light.keys(),
			...declarations.dark.keys(),
			...declarations.derived.keys(),
		]),
	]
}

function placeToken(root: TokenGroup, path: readonly string[], token: DesignToken): void {
	let group = root
	for (const key of path.slice(0, -1)) {
		const next = group[key] ?? {}
		if (typeof next === 'string' || '$value' in next) throw new Error(`Путь ${path.join('.')} проходит через токен ${key}`)
		group[key] = next
		group = next as TokenGroup
	}
	const name = path[path.length - 1]
	if (name in group) throw new Error(`Два токена с путём ${path.join('.')}`)
	group[name] = token
}

function createToken(cssVariable: string, env: CssEnv, overridden: ReadonlySet<string>): { path: string[]; token: DesignToken } {
	const resolved = resolveValue(env.get(cssVariable) as string, env)
	const { path, type } = describeToken(cssVariable, resolved)
	const extension: { cssVariable: string; css?: string } = { cssVariable }
	if (type === 'gradient') extension.css = resolved.replace(/\s+/g, ' ')
	const target = ALIAS.exec(env.get(cssVariable) as string)?.[1]
	if (target && !overridden.has(cssVariable)) {
		const targetDescription = describeToken(target, resolveValue(env.get(target) as string, env))
		if (targetDescription.type === type) {
			return {
				path,
				token: { $value: `{${targetDescription.path.join('.')}}`, $type: type, $extensions: { [EXTENSION_KEY]: extension } },
			}
		}
	}
	return { path, token: { $value: convertValue(type, resolved), $type: type, $extensions: { [EXTENSION_KEY]: extension } } }
}

/** Документ токенов для темы и режима; `theme: null` — кит без темы (значения `_tokens.scss`) */
export function buildTokenDocument(declarations: TokenDeclarations, mode: TokenMode, theme: TokenThemeSource | null = null): TokenDocument {
	const env = createEnv(declarations, mode, theme)
	const overridden = new Set([...Object.keys(theme?.vars ?? {}), ...(mode === 'dark' ? Object.keys(theme?.darkVars ?? {}) : [])])
	const root: TokenGroup = {
		$description: `Rise UI Kit: токены, тема ${theme?.name ?? 'по умолчанию'}, режим ${mode}`,
		$extensions: { [EXTENSION_KEY]: { theme: theme?.name ?? null, mode } },
	}
	for (const cssVariable of tokenNames(declarations)) {
		const { path, token } = createToken(cssVariable, env, overridden)
		placeToken(root, path, token)
	}
	return root
}

/** Файлы экспорта: `tokens.json` (кит, светлый режим) и `tokens/<тема>.<режим>.json` для каждой темы */
export function buildTokenFiles(declarations: TokenDeclarations, themes: readonly TokenThemeSource[]): TokenFile[] {
	const files: TokenFile[] = [{ path: BASE_FILE, document: buildTokenDocument(declarations, 'light') }]
	for (const theme of themes) {
		for (const mode of ['light', 'dark'] as const) {
			files.push({ path: `tokens/${theme.name}.${mode}.json`, document: buildTokenDocument(declarations, mode, theme) })
		}
	}
	return files
}

/** Записывает файлы в папку `outDir` (обычно `dist`) */
export function writeTokenFiles(outDir: string, files: readonly TokenFile[]): void {
	for (const file of files) {
		const target = join(outDir, file.path)
		mkdirSync(dirname(target), { recursive: true })
		writeFileSync(target, `${JSON.stringify(file.document, null, 2)}\n`)
	}
}

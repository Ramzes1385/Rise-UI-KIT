/**
 * Экспорт токенов в формате W3C Design Tokens: `dist/tokens.json` и `dist/tokens/<тема>.<режим>.json` (build/tokens/buildTokens.ts).
 * Запускается последним шагом `npm run build:lib:js`, после проходов Vite (они очищают `dist`).
 * Темы — `createTheme(THEME_PRESETS[имя])`: код темы живёт в `src/` и импортирует по алиасам, поэтому его загружает Vite SSR.
 *
 *   node scripts/build-tokens.mjs [папка]  — по умолчанию `dist`.
 */

import { join, resolve } from 'node:path'
import { createServer } from 'vite'
import { createAliasConfig } from '../build/config/alias.ts'
import { buildTokenFiles, writeTokenFiles } from '../build/tokens/buildTokens.ts'
import { readTokenDeclarations } from '../build/tokens/readTokensScss.ts'

const ROOT = resolve(import.meta.dirname, '..')
const outDir = resolve(process.argv[2] ?? join(ROOT, 'dist'))

const server = await createServer({
	configFile: false,
	root: ROOT,
	logLevel: 'error',
	appType: 'custom',
	server: { middlewareMode: true, ws: false },
	optimizeDeps: { noDiscovery: true, include: [] },
	resolve: { alias: createAliasConfig() },
})

try {
	const { createTheme, THEME_PRESETS, THEME_PRESET_NAMES } = await server.ssrLoadModule('/src/utils/theme/themeUtils/index.ts')
	const themes = THEME_PRESET_NAMES.map(name => createTheme(THEME_PRESETS[name]))
	const files = buildTokenFiles(readTokenDeclarations(join(ROOT, 'src/styles/_tokens.scss')), themes)
	writeTokenFiles(outDir, files)
	console.log(`Токены: ${files.length} файлов в ${outDir}`)
} finally {
	await server.close()
}

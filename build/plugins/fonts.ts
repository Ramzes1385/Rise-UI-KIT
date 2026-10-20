/**
 * Шрифты кита в пакете (src/styles/fonts, README «Шрифты»). Основной проход сборки:
 *
 * - Woff2 Rise Grotesk и Rise Mono Vite кладёт в `dist/fonts` сам — по `url()` в стилях кита (build/config/build.lib.ts, FONT_FILE);
 * - китайский и японский — `dist/fonts/cjk/{zh,ja}.css` и нарезка `dist/fonts/cjk/{sc,jp}/*.woff2` (копии src/styles/fonts/cjk),
 *   их `@font-face` в `styles.css` и `tokens.css` нет. CSS шрифта импортирует вход словаря `./locales/zh` (`dist/locales/zh.js`:
 *   `import"../fonts/cjk/zh.css"` и реэкспорт `zh` из чанка словаря): приложение, которое берёт словарь с подпути, получает шрифт
 *   само. Общие чанки и корень пакета CSS не импортируют: CSS, на который ссылается модуль из графа, Vite приложения обрабатывает
 *   и кладёт его шрифты в сборку, даже если тряска дерева потом выбросит сам CSS, — поэтому шрифт не может висеть на чанке
 *   словаря, который реэкспортирует корень;
 * - уведомление о лицензиях шрифтов (`dist/fonts/THIRD_PARTY_NOTICES.md`): OFL требует передавать его вместе со шрифтами.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import type { Plugin } from 'vite'

/** Исходники шрифтов кита: `_fonts.scss`, `files/`, `cjk/`, уведомление о лицензиях */
const FONTS_SOURCE_DIR = 'src/styles/fonts'

/** Уведомление о лицензиях шрифтов в dist — рядом с файлами шрифтов */
const FONT_NOTICES_FILE = 'fonts/THIRD_PARTY_NOTICES.md'

/** Шрифты языков с иероглифами: код и словарь языка, семейство, CSS с `@font-face` и папка нарезки (пути от src/styles/fonts и от dist/fonts) */
export const CJK_FONTS = [
	{ code: 'zh', locale: 'src/locales/zh/index.ts', family: 'Rise CJK SC', css: 'cjk/zh.css', dir: 'cjk/sc' },
	{ code: 'ja', locale: 'src/locales/ja/index.ts', family: 'Rise CJK JP', css: 'cjk/ja.css', dir: 'cjk/jp' },
] as const

const LOCALE_VIRTUAL = 'virtual:rise-locale/'
const LOCALE_RESOLVED = `\0${LOCALE_VIRTUAL}`

/** Входы `./locales/zh` и `./locales/ja` для `build.lib.entry`: имя файла в dist (`locales/zh`) → виртуальный модуль входа */
export function createLocaleFontEntries(): Record<string, string> {
	return Object.fromEntries(CJK_FONTS.map(({ code }) => [`locales/${code}`, `${LOCALE_VIRTUAL}${code}`]))
}

/** `import"../fonts/cjk/zh.css";` — путь от входа до CSS шрифта в dist */
function fontCssImport(chunkFile: string, cssFile: string): string {
	const path = posix.relative(posix.dirname(chunkFile), cssFile)
	return `import"${path.startsWith('.') ? path : `./${path}`}";`
}

export function createFontsPlugin(root: string = process.cwd()): Plugin {
	const source = (file: string) => resolve(root, FONTS_SOURCE_DIR, file)
	return {
		name: 'rise:fonts',
		apply: 'build',
		// Vite приводит входы `build.lib.entry` к абсолютному пути: код языка — всё после префикса
		resolveId(id) {
			const index = id.indexOf(LOCALE_VIRTUAL)
			return index < 0 ? null : `${LOCALE_RESOLVED}${id.slice(index + LOCALE_VIRTUAL.length)}`
		},
		load(id) {
			const font = CJK_FONTS.find(({ code }) => id === `${LOCALE_RESOLVED}${code}`)
			if (!font) return null
			return `export { ${font.code} } from ${JSON.stringify(resolve(root, font.locale).replaceAll('\\', '/'))}\n`
		},
		generateBundle(_, bundle) {
			this.emitFile({ type: 'asset', fileName: FONT_NOTICES_FILE, source: readFileSync(source('THIRD_PARTY_NOTICES.md'), 'utf8') })
			for (const { code, css, dir } of CJK_FONTS) {
				const entry = Object.values(bundle).find(
					file => file.type === 'chunk' && file.facadeModuleId === `${LOCALE_RESOLVED}${code}`,
				)
				if (entry?.type !== 'chunk') this.error(`fonts: нет входа locales/${code} — шрифт ${css} не подключить`)
				entry.code = `${fontCssImport(entry.fileName, `fonts/${css}`)}${entry.code}`
				this.emitFile({ type: 'asset', fileName: `fonts/${css}`, source: readFileSync(source(css), 'utf8') })
				for (const name of readdirSync(source(dir)).filter(file => file.endsWith('.woff2'))) {
					this.emitFile({ type: 'asset', fileName: `fonts/${dir}/${name}`, source: readFileSync(source(`${dir}/${name}`)) })
				}
			}
		},
	}
}

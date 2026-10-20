/**
 * Шрифты кита в пакете (src/styles/fonts, README «Шрифты»). Woff2 Rise Grotesk и Rise Mono Vite кладёт в `dist/fonts` сам — по `url()`
 * в стилях кита (build/config/build.lib.ts, FONT_FILE); основной проход сборки добавляет к ним уведомление о лицензиях шрифтов:
 * OFL требует, чтобы текст лицензии и авторские права шли вместе со шрифтами.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/** Исходники шрифтов кита: `_fonts.scss`, `files/`, уведомление о лицензиях */
const FONTS_SOURCE_DIR = 'src/styles/fonts'

/** Уведомление о лицензиях шрифтов в dist — рядом с файлами шрифтов */
const FONT_NOTICES_FILE = 'fonts/THIRD_PARTY_NOTICES.md'

export function createFontsPlugin(root: string = process.cwd()): Plugin {
	return {
		name: 'rise:fonts',
		apply: 'build',
		generateBundle() {
			const source = readFileSync(resolve(root, FONTS_SOURCE_DIR, 'THIRD_PARTY_NOTICES.md'), 'utf8')
			this.emitFile({ type: 'asset', fileName: FONT_NOTICES_FILE, source })
		},
	}
}

/** Глобальный prelude инжектится во все стили компонентов, кроме самих модулей-источников — иначе Sass-ошибка «Module loop». */

import type { CSSOptions } from 'vite'
import { isProductionMode } from '../utils/helpers.ts'

const GLOBAL_SCSS_PRELUDE = ['@use "@styles/variables" as *;', '@use "@styles/mixins" as *;', '@use "@styles/functions" as *;', ''].join(
	'\n',
)

const GLOBAL_SCSS_FILES = ['_tokens.scss', '_variables.scss', '_mixins.scss', '_functions.scss']

function shouldSkipImport(filename: string): boolean {
	return GLOBAL_SCSS_FILES.some(file => filename.endsWith(file))
}

function addGlobalImports(source: string, filename: string): string {
	if (shouldSkipImport(filename)) return source
	return `${GLOBAL_SCSS_PRELUDE}${source}`
}

/** Настройки Sass с глобальным prelude — общие для сборки библиотеки, Storybook и Vitest. */
export function createScssOptions() {
	return {
		additionalData: addGlobalImports,
		charset: false,
	}
}

export function createCssConfig(mode: string): CSSOptions {
	const isProduction = isProductionMode(mode)

	return {
		transformer: 'lightningcss',
		preprocessorOptions: {
			scss: createScssOptions(),
		},

		devSourcemap: !isProduction,
	}
}

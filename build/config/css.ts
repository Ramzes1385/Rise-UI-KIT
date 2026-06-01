/**
 * Конфигурация стилей UI-библиотеки.
 * Глобальные SCSS-модули (variables/mixins/functions) автоматически инжектятся
 * во все компонентные стили через prelude, кроме самих модулей-источников
 * (иначе Sass-ошибка «Module loop: this module is already being loaded»).
 * Sass: modern-compiler API. CSS-трансформ/минификация: Lightning CSS.
 */

import type { CSSOptions } from 'vite'
import { isProductionMode } from '../utils/helpers'

/** Глобальный prelude — автоматически инжектится во все .scss-entry компонентов. */
const GLOBAL_SCSS_PRELUDE = [
	'@use "@styles/variables" as *;',
	'@use "@styles/mixins" as *;',
	'@use "@styles/functions" as *;',
	'',
].join('\n')

/** Глобальные SCSS-файлы — не должны импортировать сами себя (защита от module loop). */
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

function shouldSkipImport(filename: string): boolean {
	return GLOBAL_SCSS_FILES.some(file => filename.endsWith(file))
}

function addGlobalImports(source: string, filename: string): string {
	if (shouldSkipImport(filename)) return source
	return `${GLOBAL_SCSS_PRELUDE}${source}`
}

/** Создаёт конфигурацию CSS для Vite. */
export function createCssConfig(mode: string): CSSOptions {
	const isProduction = isProductionMode(mode)

	return {
		transformer: 'lightningcss',
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				additionalData: addGlobalImports,
				charset: false,
			},
		},

		devSourcemap: !isProduction,
	}
}

/**
 * Конфигурация стилей: SCSS, PostCSS, CSS-модули.
 * Глобальные переменные и миксины подключаются автоматически
 * через additionalData — не нужно импортировать вручную в каждом компоненте.
 */

import type { CSSOptions } from 'vite'
import { isProductionMode } from '../utils/helpers'

/** Глобальные SCSS-файлы, доступные во всех компонентах без импорта */
const GLOBAL_SCSS_IMPORTS = [
	'@use "@/shared/assets/styles/variables" as *;',
	'@use "@/shared/assets/styles/mixins" as *;',
	'@use "@/shared/assets/styles/functions" as *;',
].join('\n')

/** Глобальные SCSS-файлы, которые не должны импортировать сами себя */
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

/** Создаёт конфигурацию CSS для Vite */
export function createCssConfig(mode: string): CSSOptions {
	const isProduction = isProductionMode(mode)

	return {
		preprocessorOptions: {
			scss: {
				additionalData: (source: string, filename: string) => {
					const isGlobal = GLOBAL_SCSS_FILES.some(f => filename.endsWith(f))
					if (isGlobal) return source
					return `${GLOBAL_SCSS_IMPORTS}\n${source}`
				},
				silenceDeprecations: ['legacy-js-api'],
				charset: false,
			},
		},

		modules: {
			localsConvention: 'camelCaseOnly',
			generateScopedName: isProduction ? '[hash:base64:8]' : '[name]__[local]--[hash:base64:5]',
		},

		devSourcemap: !isProduction,
	}
}

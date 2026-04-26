/**
 * Плагин Vue — компиляция SFC, defineModel, propsDestructure.
 */

import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'
import { isProductionMode } from '../utils/helpers'

/** Создаёт плагин Vue с оптимальными настройками */
export function createVuePlugin(mode: string): PluginOption {
	const isProduction = isProductionMode(mode)

	return vue({
		script: {
			defineModel: true,
			propsDestructure: true,
		},

		template: {
			compilerOptions: {
				// В production удаляем комментарии из шаблонов — экономия размера
				comments: !isProduction,
			},
		},
	})
}

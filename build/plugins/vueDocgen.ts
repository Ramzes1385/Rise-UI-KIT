/**
 * Замена `storybook:vue-docgen-plugin` из @storybook/vue3-vite: тот вызывает `parse(id)` без алиасов,
 * и vue-docgen-api не находит `@composables/...` в импортах типов (предупреждения «Neither '…' nor …»).
 * Здесь docgen получает те же алиасы, что и Vite; остальное поведение совпадает с исходным плагином.
 * vue-docgen-api — зависимость @storybook/vue3-vite, поэтому берём ту же копию, а не объявляем новую зависимость.
 */

import { createRequire } from 'node:module'
import type { Plugin } from 'vite'
import { createAliasConfig } from '../config/alias.ts'

export const STORYBOOK_DOCGEN_PLUGIN_NAME = 'storybook:vue-docgen-plugin'

type DocgenParse = (filePath: string, options: { alias: Record<string, string> }) => Promise<unknown>

const VUE_FILE = /\.vue$/

function loadDocgenParse(): DocgenParse {
	const requireFromStorybook = createRequire(import.meta.resolve('@storybook/vue3-vite'))

	return requireFromStorybook('vue-docgen-api').parse
}

/** '@/' дублирует '@' со слэшем в конце — docgen он не нужен */
function createDocgenAlias(): Record<string, string> {
	const alias = createAliasConfig() as Record<string, string>

	return Object.fromEntries(Object.entries(alias).filter(([key]) => key !== '@/'))
}

export function createVueDocgenPlugin(): Plugin {
	const parse = loadDocgenParse()
	const alias = createDocgenAlias()

	return {
		name: STORYBOOK_DOCGEN_PLUGIN_NAME,
		transform: {
			filter: { id: VUE_FILE },
			async handler(src, id) {
				if (!VUE_FILE.test(id)) return undefined

				const metaData = await parse(id, { alias })
				const code = `${src};_sfc_main.__docgenInfo = Object.assign({
        displayName: _sfc_main.name ?? _sfc_main.__name
      }, ${JSON.stringify(metaData)});`

				return { code, map: null }
			},
		},
	}
}

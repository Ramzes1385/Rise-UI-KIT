/** Утилиты: резолвер `RiseUiResolver` для `unplugin-vue-components` — имя компонента в шаблоне → импорт с подпути пакета */

import { SUBPATH_COMPONENT_NAMES } from '../componentNames'
import type { RiseUiComponentResolver, RiseUiResolvedComponent, RiseUiResolverOptions, RiseUiTokensMode } from '../types/integrations.types'

const PACKAGE = '@ramzes1385/rise-ui-kit'
const TOKENS_CSS = `${PACKAGE}/tokens.css`
const TOKENS_LAYER_CSS = `${PACKAGE}/tokens.layer.css`

const SUBPATH_COMPONENTS: ReadonlySet<string> = new Set(SUBPATH_COMPONENT_NAMES)

/** Плеер лежит в своём подпути, а стили — в отдельном файле: у остальных компонентов CSS подключает сам подпуть */
const MEDIA_PLAYER = 'BaseMediaPlayer'

function tokensFile(tokens: RiseUiTokensMode): string | undefined {
	if (!tokens) return undefined
	return tokens === 'layer' ? TOKENS_LAYER_CSS : TOKENS_CSS
}

function describeComponent(name: string): Omit<RiseUiResolvedComponent, 'sideEffects'> & { styles: string[] } {
	if (name === MEDIA_PLAYER) return { name, from: `${PACKAGE}/media`, styles: [`${PACKAGE}/media.css`] }
	return { name, from: `${PACKAGE}/${name}`, styles: [] }
}

/**
 * Резолвер для `unplugin-vue-components`: `<BaseButton>` в шаблоне — `import { BaseButton } from '@ramzes1385/rise-ui-kit/BaseButton'`.
 * Резолвит только публичные компоненты кита; остальные имена оставляет плагину. CSS компонента подключает сам подпуть,
 * поэтому `sideEffects` нужен лишь для токенов (опция `tokens`) и стилей плеера (`media.css`).
 *
 * @example
 * Components({ resolvers: [RiseUiResolver({ tokens: true })] })
 */
export function RiseUiResolver(options: RiseUiResolverOptions = {}): RiseUiComponentResolver {
	const prefix = options.prefix ?? ''
	const tokens = tokensFile(options.tokens ?? false)
	return {
		type: 'component',
		resolve(name) {
			if (!name.startsWith(prefix)) return undefined
			const component = name.slice(prefix.length)
			if (component !== MEDIA_PLAYER && !SUBPATH_COMPONENTS.has(component)) return undefined
			const { styles, ...info } = describeComponent(component)
			const sideEffects = tokens ? [tokens, ...styles] : styles
			return sideEffects.length > 0 ? { ...info, sideEffects } : info
		},
	}
}

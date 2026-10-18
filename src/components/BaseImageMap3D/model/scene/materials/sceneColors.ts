import type { SceneColorResolver, SceneObjectState, SceneStateColor } from '../../../types/internal/imageMap3dInternal.types'

const STATES: SceneObjectState[] = ['base', 'hover', 'active']
const DEFAULT_OPACITY: Record<SceneObjectState, number> = { base: 0.7, hover: 0.85, active: 1 }
const DEFAULT_FILL = 'var(--rise-primary)'

export const FLOOR_COLOR = 'var(--rise-bg-muted)'
export const FLOOR_SIDE_COLOR = 'var(--rise-border)'

function stateValue(style: Record<string, string>, name: string, state: SceneObjectState): string | undefined {
	return state === 'base' ? style[name] : (style[`${name}-${state}`] ?? style[name])
}

function stateOpacity(style: Record<string, string>, state: SceneObjectState): number {
	const own = state === 'base' ? style['--im-fill-opacity'] : style[`--im-fill-opacity-${state}`]
	const value = Number(own)
	return own !== undefined && Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : DEFAULT_OPACITY[state]
}

export function stateColors(style: Record<string, string>, resolve: SceneColorResolver): Record<SceneObjectState, SceneStateColor> {
	const entries = STATES.map(state => {
		const fill = stateValue(style, '--im-fill', state) ?? DEFAULT_FILL
		return [state, { color: resolve(fill), opacity: stateOpacity(style, state) }] as const
	})
	return Object.fromEntries(entries) as Record<SceneObjectState, SceneStateColor>
}

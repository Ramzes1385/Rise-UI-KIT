import { Color } from 'three'
import type { SceneColorResolver, SceneObjectState, SceneStateColor } from '../../../types/internal/imageMap3dInternal.types'

const STATES: SceneObjectState[] = ['base', 'hover', 'active']
const DEFAULT_OPACITY: Record<SceneObjectState, number> = { base: 0.7, hover: 0.85, active: 1 }
const DEFAULT_FILL = 'var(--rise-primary)'
const FALLBACK_COLOR = '#808080'
const SIMPLE_COLOR = /^(#|rgba?\(|hsla?\()/i
const VAR_ONLY = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^]+?))?\s*\)$/i

export const FLOOR_COLOR = 'var(--rise-bg-muted)'
export const FLOOR_SIDE_COLOR = 'var(--rise-border)'

function sampleColor(context: CanvasRenderingContext2D, css: string): Color {
	context.clearRect(0, 0, 1, 1)
	context.fillStyle = FALLBACK_COLOR
	context.fillStyle = css
	context.fillRect(0, 0, 1, 1)
	const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
	if (!alpha) return new Color(FALLBACK_COLOR)
	return new Color().setRGB(red / 255, green / 255, blue / 255, 'srgb')
}

export function parseCssColor(css: string, context: CanvasRenderingContext2D | null): Color {
	const value = css.trim()
	if (context && value) return sampleColor(context, value)
	return new Color(SIMPLE_COLOR.test(value) ? value : FALLBACK_COLOR)
}

function withoutMissingVar(host: HTMLElement, css: string): string {
	const match = VAR_ONLY.exec(css.trim())
	if (!match || getComputedStyle(host).getPropertyValue(match[1]).trim()) return css
	return match[2] ? withoutMissingVar(host, match[2]) : FALLBACK_COLOR
}

export function createColorResolver(host: HTMLElement): SceneColorResolver {
	const probe = document.createElement('span')
	probe.hidden = true
	const cache = new Map<string, Color>()
	let context: CanvasRenderingContext2D | null | undefined
	return css => {
		const cached = cache.get(css)
		if (cached) return cached
		const value = withoutMissingVar(host, css)
		context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
		host.append(probe)
		probe.style.color = ''
		probe.style.color = value
		const color = parseCssColor(probe.style.color ? getComputedStyle(probe).color || value : FALLBACK_COLOR, context)
		probe.remove()
		cache.set(css, color)
		return color
	}
}

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

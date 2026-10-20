import { Color } from 'three'
import { resolveScenePalette } from '@/scene3d/theme/scenePalette'
import { createColorResolver } from '@/scene3d/theme/colorResolver'
import type { Roadmap3DColors, Roadmap3DPalette } from '../../types/internal/roadmap3dInternal.types'

const WHITE = new Color('#ffffff')
const RIM_SHARE = 0.55

export function createRoadmapPalette(host: HTMLElement): Roadmap3DPalette {
	const resolve = createColorResolver(host)
	return { palette: resolveScenePalette(resolve), resolve }
}

function mixColor(from: Color, to: Color, share: number): Color {
	return from.clone().lerp(to, share)
}

const TOKENS = {
	top: 'var(--rise-roadmap-3d-top, color-mix(in srgb, var(--rise-chart-1) 14%, var(--rise-bg-muted)))',
	side: 'var(--rise-roadmap-3d-side, color-mix(in srgb, var(--rise-chart-7) 18%, color-mix(in srgb, var(--rise-chart-1) 14%, var(--rise-bg-muted))))',
	cliffs: [
		'var(--rise-roadmap-3d-cliff-1, color-mix(in srgb, var(--rise-chart-1) 38%, var(--rise-bg)))',
		'var(--rise-roadmap-3d-cliff-2, color-mix(in srgb, var(--rise-chart-1) 62%, var(--rise-bg)))',
		'var(--rise-roadmap-3d-cliff-3, color-mix(in srgb, var(--rise-chart-7) 70%, var(--rise-chart-1)))',
	],
	road: 'var(--rise-roadmap-3d-road, color-mix(in srgb, color-mix(in srgb, var(--rise-chart-1) 60%, var(--rise-chart-7)) 55%, black))',
	curb: 'var(--rise-roadmap-3d-curb, color-mix(in srgb, var(--rise-chart-1) 30%, white))',
	dash: 'var(--rise-roadmap-3d-dash, color-mix(in srgb, var(--rise-chart-1) 6%, white))',
	done: 'var(--rise-roadmap-3d-done, var(--rise-chart-2))',
	doneEnd: 'var(--rise-roadmap-3d-done-end, color-mix(in srgb, var(--rise-chart-5) 80%, var(--rise-chart-2)))',
	mountain: 'var(--rise-roadmap-3d-mountain, color-mix(in srgb, var(--rise-chart-1) 50%, white))',
}

export function roadmapColors(source: Roadmap3DPalette): Roadmap3DColors {
	const { colors } = source.palette
	const pick = (css: string): Color => source.resolve(css).clone()
	const bg = pick('var(--rise-bg)')
	const top = pick(TOKENS.top)
	return {
		top,
		side: pick(TOKENS.side),
		cliffs: TOKENS.cliffs.map(pick),
		rim: mixColor(top, WHITE, RIM_SHARE),
		road: pick(TOKENS.road),
		curb: pick(TOKENS.curb),
		dash: pick(TOKENS.dash),
		doneFrom: pick(TOKENS.done),
		doneTo: pick(TOKENS.doneEnd),
		success: pick('var(--rise-success)'),
		primary: pick('var(--rise-primary)'),
		onPrimary: pick('var(--rise-text-inverted)'),
		locked: mixColor(top, colors.cliff, 0.35),
		neutral: pick('var(--rise-border-accented)'),
		warning: pick('var(--rise-warning)'),
		alternative: pick('var(--rise-chart-1)'),
		mountain: pick(TOKENS.mountain),
		snow: mixColor(bg, WHITE, 0.7),
		trunk: mixColor(colors.cliff, WHITE, 0.4),
		cones: ['var(--rise-chart-5)', 'var(--rise-chart-4)', 'var(--rise-chart-2)'].map(pick),
		round: mixColor(pick('var(--rise-chart-1)'), WHITE, 0.3),
		cloud: mixColor(bg, WHITE, 0.8),
	}
}

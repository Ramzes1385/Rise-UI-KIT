import { Color } from 'three'
import { resolveScenePalette } from '@/scene3d/theme/scenePalette'
import { createColorResolver } from '@/scene3d/theme/colorResolver'
import type { Roadmap3DColors, Roadmap3DPalette } from '../../types/internal/roadmap3dInternal.types'

const WHITE = new Color('#ffffff')
const RIM_SHARE = 0.55
const CLIFF_STEP = 0.2

export function createRoadmapPalette(host: HTMLElement): Roadmap3DPalette {
	const resolve = createColorResolver(host)
	return { palette: resolveScenePalette(resolve), resolve }
}

function mixColor(from: Color, to: Color, share: number): Color {
	return from.clone().lerp(to, share)
}

export function roadmapColors(source: Roadmap3DPalette): Roadmap3DColors {
	const { colors } = source.palette
	const pick = (css: string): Color => source.resolve(css).clone()
	const bg = pick('var(--rise-bg)')
	return {
		top: colors.islandTop,
		side: mixColor(colors.islandTop, colors.cliff, 0.5),
		cliffs: [0, 1, 2].map(step => colors.cliff.clone().multiplyScalar(1 - CLIFF_STEP * step)),
		rim: mixColor(colors.islandTop, WHITE, RIM_SHARE),
		road: colors.road,
		curb: mixColor(bg, WHITE, 0.4),
		doneFrom: pick('var(--rise-chart-2)'),
		doneTo: pick('var(--rise-chart-5)'),
		success: pick('var(--rise-success)'),
		primary: pick('var(--rise-primary)'),
		onPrimary: pick('var(--rise-text-inverted)'),
		locked: mixColor(colors.islandTop, colors.cliff, 0.6),
		neutral: pick('var(--rise-border-accented)'),
		warning: pick('var(--rise-warning)'),
		alternative: pick('var(--rise-chart-1)'),
		mountain: mixColor(pick('var(--rise-chart-1)'), WHITE, 0.35),
		snow: mixColor(bg, WHITE, 0.7),
		trunk: mixColor(colors.cliff, WHITE, 0.4),
		cones: ['var(--rise-chart-5)', 'var(--rise-chart-4)', 'var(--rise-chart-2)'].map(pick),
		round: mixColor(pick('var(--rise-chart-1)'), WHITE, 0.3),
		cloud: mixColor(bg, WHITE, 0.8),
	}
}

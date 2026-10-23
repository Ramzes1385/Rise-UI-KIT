import { Color } from 'three'
import type { Model3DTone } from '@/scene3d/types/model3d.types'
import { createColorResolver } from '@/scene3d/theme/colorResolver'
import type { ScenePalette } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { FlowStatusDef } from '@components/BaseFlowMap/types/data/flowData.types'
import { contrastRatio, groundTextTone, resolveScenePalette } from '@/scene3d/theme/scenePalette'
import type { FlowMap3DEdgeItem, FlowMap3DPalette } from '../../types/internal/flowMap3dInternal.types'

const STATUS_TONES: Record<string, Model3DTone> = {
	ok: 'none',
	warning: 'warning',
	error: 'danger',
	down: 'muted',
	unknown: 'muted',
}

const COLOR_TONES: ReadonlyArray<readonly [string, Model3DTone]> = [
	['success', 'success'],
	['warning', 'warning'],
	['error', 'danger'],
	['danger', 'danger'],
	['muted', 'muted'],
	['dimmed', 'muted'],
]

const SOLID_ROLES = ['bodySoft', 'metal', 'body', 'screen', 'platform'] as const
const SOLID_CONTRAST = 3.2
const CONTRAST_STEP = 0.08

function lifted(palette: ScenePalette): ScenePalette {
	const { ground } = palette.colors
	const target = new Color(palette.isDark ? 0xffffff : 0x000000)
	SOLID_ROLES.forEach(role => {
		const color = palette.colors[role]
		for (let step = 0; step < 12 && contrastRatio(color, ground) < SOLID_CONTRAST; step += 1) color.lerp(target, CONTRAST_STEP)
	})
	return palette
}

export function createPalette(host: HTMLElement): FlowMap3DPalette {
	const resolve = createColorResolver(host)
	return { palette: lifted(resolveScenePalette(resolve)), resolve }
}

export function toneOf(status: string | undefined, defs: readonly FlowStatusDef[] | undefined): Model3DTone {
	if (!status) return 'none'
	const custom = defs?.find(def => def.id === status)
	if (custom) return COLOR_TONES.find(([word]) => custom.color.includes(word))?.[1] ?? 'info'
	return STATUS_TONES[status] ?? 'info'
}

function cssOf(color: Color): string {
	return `#${color.getHexString()}`
}

export function textColor(palette: FlowMap3DPalette): string {
	return cssOf(groundTextTone(palette.palette).color)
}

export function edgeColor(item: FlowMap3DEdgeItem, palette: FlowMap3DPalette): Color {
	if (item.color) return palette.resolve(item.color)
	const { line, lineAsync } = palette.palette.colors
	return item.stroke === 'dashed' ? lineAsync : line
}

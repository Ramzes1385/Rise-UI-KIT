import { textColor } from '../flowMap3dPalette'
import { createLabelBatch } from './groundLabels'
import { createGroundTextAtlas } from '@/scene3d/geometry/groundText'
import type { GroundTextAtlas } from '@/scene3d/types/internal/scene3dGeometry.types'
import type {
	FlowMap3DEdgeItem,
	FlowMap3DGroundLabel,
	FlowMap3DGroupItem,
	FlowMap3DLabels,
	FlowMap3DPalette,
} from '../../../types/internal/flowMap3dInternal.types'

const GROUP_HEIGHT = 0.42
const GROUP_WEIGHT = 700
const GROUP_INSET = 0.6
const GROUP_GAP = 0.55
const EDGE_HEIGHT = 0.3
const EDGE_WEIGHT = 500

function groupLabels(items: readonly FlowMap3DGroupItem[], atlas: GroundTextAtlas, isLayered: boolean): FlowMap3DGroundLabel[] {
	return items.flatMap(item => {
		const id = `group:${item.id}`
		const isFlagged = isLayered && item.depth === 0
		const entry = item.base === 'none' || !item.label || isFlagged ? null : atlas.add(id, item.label, GROUP_WEIGHT)
		if (!entry) return []
		const half = (GROUP_HEIGHT * entry.aspect) / 2
		const x = Math.min(item.rect.x0 + GROUP_INSET + half, (item.rect.x0 + item.rect.x1) / 2)
		return [{ id, text: item.label, x, y: item.y, z: item.rect.z1 + GROUP_GAP, angle: 0, height: GROUP_HEIGHT, weight: GROUP_WEIGHT }]
	})
}

function edgeLabels(items: readonly FlowMap3DEdgeItem[], atlas: GroundTextAtlas): FlowMap3DGroundLabel[] {
	return items.flatMap(item => {
		const id = `edge:${item.id}`
		const spot = item.labelSpot
		if (!spot || !item.label || !atlas.add(id, item.label, EDGE_WEIGHT)) return []
		return [{ id, text: item.label, ...spot, height: EDGE_HEIGHT, weight: EDGE_WEIGHT }]
	})
}

export function buildLabels(
	parts: { groups: readonly FlowMap3DGroupItem[]; edges: readonly FlowMap3DEdgeItem[]; isLayered: boolean },
	palette: FlowMap3DPalette,
): FlowMap3DLabels {
	const atlas = createGroundTextAtlas({ color: textColor(palette) })
	const labels = [...groupLabels(parts.groups, atlas, parts.isLayered), ...edgeLabels(parts.edges, atlas)]
	const batch = createLabelBatch(atlas, labels)
	return {
		mesh: batch.mesh,
		orient: batch.orient,
		recolor: next => atlas.recolor(textColor(next)),
		dispose: () => {
			batch.dispose()
			atlas.dispose()
		},
	}
}

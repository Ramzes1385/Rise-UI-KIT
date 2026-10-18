import type { FlowGroup } from '../../../types/data/flowData.types'
import type { C4ZoomLevel } from '../../../types/notations/architecture/c4.types'

export const C4_ZOOM_LEVELS: C4ZoomLevel[] = [
	{ minZoom: 0.45, depth: 0 },
	{ minZoom: 0.85, depth: 1 },
]

const MAX_DEPTH = 16

export function allowedDepth(zoom: number, levels: readonly C4ZoomLevel[] = C4_ZOOM_LEVELS): number {
	const level = [...levels].sort((a, b) => a.minZoom - b.minZoom).find(item => zoom < item.minZoom)
	return level ? level.depth : Infinity
}

function depthOf(group: FlowGroup, byId: ReadonlyMap<string, FlowGroup>): number {
	let depth = 0
	let parent = group.parent
	while (parent !== undefined && depth < MAX_DEPTH) {
		depth += 1
		parent = byId.get(parent)?.parent
	}
	return depth
}

export function collapsedGroupIds(
	groups: readonly FlowGroup[],
	zoom: number,
	levels: readonly C4ZoomLevel[] = C4_ZOOM_LEVELS,
): Set<string> {
	const allowed = allowedDepth(zoom, levels)
	const byId = new Map(groups.map(group => [group.id, group]))
	return new Set(groups.filter(group => depthOf(group, byId) >= allowed).map(group => group.id))
}

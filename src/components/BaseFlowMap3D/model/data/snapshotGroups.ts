import { groupRects } from './snapshotPlan'
import type { FlowGroup } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DGroupItem, FlowMap3DLevels, FlowMap3DPlan } from '../../types/internal/flowMap3dInternal.types'

function depthOf(group: FlowGroup, groups: ReadonlyMap<string, FlowGroup>): number {
	let depth = 0
	for (let parent = group.parent; parent && depth < 16; parent = groups.get(parent)?.parent) depth += 1
	return depth
}

export function buildGroupItems(model: FlowModelInternal, plan: FlowMap3DPlan, levels: FlowMap3DLevels): FlowMap3DGroupItem[] {
	const { unit, origin } = plan
	const groups = new Map((model.shown.value.groups ?? []).map(group => [group.id, group]))
	const rects = groupRects(model)
	return [...groups.values()].flatMap(group => {
		const rect = rects.get(group.id)
		if (!rect) return []
		const spot = levels.groups.get(group.id) ?? { tier: 0, y: 0, z: 0 }
		return [
			{
				id: group.id,
				group,
				rect: {
					x0: rect.x / unit - origin.x,
					z0: rect.y / unit - origin.z + spot.z,
					x1: (rect.x + rect.width) / unit - origin.x,
					z1: (rect.y + rect.height) / unit - origin.z + spot.z,
				},
				y: spot.y,
				tier: spot.tier,
				shift: spot.z,
				base: group.model3d?.base ?? 'dashed',
				depth: depthOf(group, groups),
				label: group.label,
			},
		]
	})
}

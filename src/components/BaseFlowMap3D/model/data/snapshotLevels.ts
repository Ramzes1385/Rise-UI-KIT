import type { FlowGroup } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DLayers, FlowMap3DLevels, FlowMap3DTierSpot } from '../../types/internal/flowMap3dInternal.types'

const DEFAULT_GAP = 2.5
const MAX_DEPTH = 16
const STEP_BACK = 0.35

const GROUND: FlowMap3DTierSpot = { tier: 0, y: 0, z: 0 }

function topOf(group: FlowGroup, groups: ReadonlyMap<string, FlowGroup>): FlowGroup {
	let current = group
	for (let depth = 0; current.parent && depth < MAX_DEPTH; depth += 1) current = groups.get(current.parent) ?? current
	return current
}

export function levelGap(value: number | undefined): number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_GAP
}

function spotOf(tier: number, layers: FlowMap3DLayers): FlowMap3DTierSpot {
	if (!layers.isLayered) return { tier, y: 0, z: 0 }
	return { tier, y: tier * layers.gap, z: -tier * layers.gap * STEP_BACK }
}

export function computeLevels(model: FlowModelInternal, layers: FlowMap3DLayers): FlowMap3DLevels {
	const levels: FlowMap3DLevels = { nodes: new Map(), groups: new Map(), top: 0, isLayered: layers.isLayered }
	const groups = new Map((model.shown.value.groups ?? []).map(group => [group.id, group]))
	const tops = [...groups.values()].filter(group => !group.parent)
	const tierOf = (group: FlowGroup): number => {
		const top = topOf(group, groups)
		return top.model3d?.level ?? tops.indexOf(top)
	}
	groups.forEach(group => levels.groups.set(group.id, spotOf(tierOf(group), layers)))
	model.shown.value.nodes.forEach(node => {
		const group = node.group ? groups.get(node.group) : undefined
		levels.nodes.set(node.id, group ? spotOf(tierOf(group), layers) : { ...GROUND })
	})
	levels.top = Math.max(0, ...[...levels.nodes.values(), ...levels.groups.values()].map(spot => spot.y))
	return levels
}

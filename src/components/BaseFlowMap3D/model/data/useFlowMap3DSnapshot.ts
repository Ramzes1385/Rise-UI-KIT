import { computed } from 'vue'
import { contentRect } from './snapshotPlan'
import { buildEdgeItems } from './snapshotEdges'
import { unitOf } from '../camera/flowMap3dFrame'
import { buildGroupItems } from './snapshotGroups'
import { computeLevels, levelGap } from './snapshotLevels'
import { buildNodeItems, medianCell, MODEL_HEIGHT } from './snapshotNodes'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DNodeItem, FlowMap3DPlan, FlowMap3DSnapshot } from '../../types/internal/flowMap3dInternal.types'

const MARGIN = 0.75

function planBounds(snapshot: Pick<FlowMap3DSnapshot, 'nodes' | 'groups'>): FlowMap3DSnapshot['bounds'] {
	const rects = [
		...snapshot.nodes.map(item => ({ x0: item.x - 1, z0: item.z - 1, x1: item.x + 1, z1: item.z + 1 })),
		...snapshot.groups.map(item => item.rect),
	]
	if (rects.length === 0) return { x0: 0, z0: 0, x1: 1, z1: 1 }
	return {
		x0: Math.min(...rects.map(rect => rect.x0)) - MARGIN,
		z0: Math.min(...rects.map(rect => rect.z0)) - MARGIN,
		x1: Math.max(...rects.map(rect => rect.x1)) + MARGIN,
		z1: Math.max(...rects.map(rect => rect.z1)) + MARGIN,
	}
}

function heightOf(nodes: readonly FlowMap3DNodeItem[]): number {
	return nodes.reduce((height, item) => Math.max(height, item.elevation + item.height * 1.4), MODEL_HEIGHT)
}

function planOf(model: FlowModelInternal): FlowMap3DPlan {
	const unit = unitOf(model.data.value.view3d?.unit)
	const { x, y, width, height } = contentRect(model)
	return { unit, origin: { x: (x + width / 2) / unit, z: (y + height / 2) / unit } }
}

function createSnapshot(model: FlowModelInternal, isLayered: boolean): FlowMap3DSnapshot {
	const plan = planOf(model)
	const { unit } = plan
	const levels = computeLevels(model, { isLayered, gap: levelGap(model.data.value.view3d?.levelGap) })
	const nodes = buildNodeItems(model, plan, levels)
	const width = medianCell(
		nodes.map(item => item.rect),
		unit,
	)
	const groups = buildGroupItems(model, plan, levels)
	const edges = buildEdgeItems(model, {
		nodes: new Map(nodes.map(item => [item.id, item])),
		groups: new Map(groups.map(item => [item.id, item])),
		levels,
		plan,
		reach: width / 2,
	})
	const cell = { width, depth: width, height: width * 1.2 }
	return {
		isLayered,
		unit,
		origin: plan.origin,
		nodes,
		groups,
		edges,
		cell,
		bounds: planBounds({ nodes, groups }),
		height: heightOf(nodes),
	}
}

export function useFlowMap3DSnapshot(model: FlowModelInternal, getIsLayered: () => boolean) {
	return computed(() => createSnapshot(model, getIsLayered()))
}

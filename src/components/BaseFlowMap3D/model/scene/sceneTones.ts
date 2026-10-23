import { toneOf } from './flowMap3dPalette'
import type { Model3DTone } from '@/scene3d/types/model3d.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'

export function nodeTones(model: FlowModelInternal): Map<string, Model3DTone> {
	const live = model.live.value.nodes
	const defs = model.data.value.statuses
	return new Map(model.shown.value.nodes.map(node => [node.id, toneOf(live?.[node.id]?.status ?? node.status, defs)]))
}

export function scenarioIds(model: FlowModelInternal): Set<string> {
	const { activeSteps } = model.scenario.state.value
	const ids = new Set<string>()
	if (activeSteps.length === 0) return ids
	const graph = model.graph.value
	model.scenario.timeline.value
		.filter(entry => activeSteps.includes(entry.step))
		.forEach(entry => {
			if (entry.node) ids.add(entry.node)
			const edge = entry.edge ? graph.edges.get(entry.edge) : undefined
			if (edge) [entry.edge as string, edge.source, edge.target].forEach(id => ids.add(id))
		})
	return ids
}

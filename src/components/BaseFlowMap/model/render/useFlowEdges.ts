import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { highlightOf } from '../context/useFlowHighlight'
import { endMarkerOf, startMarkerOf } from './flowMarkers'
import { describeEdge, statusView } from '../a11y/flowDescribe'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import type { FlowEdgeItem, FlowLabelItem, FlowRenderSource } from '../../types/internal/core/flowRenderInternal.types'

function nameOf(nodes: ReadonlyMap<string, FlowNode>, edge: FlowEdge): { source: string; target: string } {
	return { source: nodes.get(edge.source)?.label ?? edge.source, target: nodes.get(edge.target)?.label ?? edge.target }
}

function buildEdge(edge: FlowEdge, source: FlowRenderSource, names: ReadonlyMap<string, FlowNode>): FlowEdgeItem | null {
	const { model } = source
	const route = model.routes.value[edge.id]
	if (!route) return null
	const kind = model.edgeKind(edge)
	return {
		...{ id: edge.id, edge, kind, route, color: kind.color, tabIndex: -1 },
		...highlightOf(source.active.value, edge.id),
		markerStart: startMarkerOf(kind)?.id ?? null,
		markerEnd: endMarkerOf(kind)?.id ?? null,
		status: statusView(model.live.value.edges?.[edge.id]?.status ?? edge.status, model.data.value.statuses),
		isSelected: model.selection.value.includes(edge.id),
		ariaLabel: describeEdge(edge, kind.label(), nameOf(names, edge)),
	}
}

export function useFlowEdges(source: FlowRenderSource): ComputedRef<FlowEdgeItem[]> {
	return computed(() => {
		const names = new Map(source.model.shown.value.nodes.map(node => [node.id, node]))
		return source.model.shown.value.edges.flatMap(edge => buildEdge(edge, source, names) ?? [])
	})
}

export function useFlowLabels(edges: ComputedRef<FlowEdgeItem[]>, isHidden: ComputedRef<boolean>): ComputedRef<FlowLabelItem[]> {
	return computed(() => {
		if (isHidden.value) return []
		return edges.value.flatMap(item => {
			const point = item.route.label?.point
			if (!item.edge.label || !point) return []
			return [{ id: item.id, edge: item.edge, text: item.edge.label, point, isHighlighted: item.isHighlighted, isDim: item.isDim }]
		})
	})
}

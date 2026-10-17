import type { FlowNode } from '../../types/data/flowData.types'
import type { FlowNodeKindDef, FlowNotation, FlowShapeMarker } from '../../types/api/flowNotation.types'

export function markersOf(def: FlowNodeKindDef, node: FlowNode): FlowShapeMarker[] {
	return def.shape.markers?.(node) ?? []
}

export function propLabels(def: FlowNodeKindDef): string[] {
	return Object.values(def.props ?? {}).flatMap(prop => [prop.label(), ...(prop.options ?? []).map(option => option.label())])
}

export function allLabels(notation: FlowNotation): string[] {
	return [
		notation.label(),
		notation.rulesSummary?.() ?? '',
		...Object.values(notation.nodeKinds).flatMap(def => [
			def.label(),
			...propLabels(def),
			...(def.ports ?? []).map(item => item.label ?? ''),
		]),
		...Object.values(notation.edgeKinds).map(def => def.label()),
	]
}

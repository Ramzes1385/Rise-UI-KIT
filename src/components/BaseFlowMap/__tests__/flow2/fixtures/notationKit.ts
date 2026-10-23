import { createScope } from './flow2Scope'
import { buildFlowGraph } from '../../../model/data/flowGraph'
import { runFlowLayout } from '../../../model/layout/useFlowLayout'
import type { FlowLayoutSettings, FlowMapData, FlowRect } from '../../../types/data/flowData.types'
import type { FlowNotation, FlowConnectContext, FlowRuleResult } from '../../../types/api/flowNotation.types'

function connectContext(data: FlowMapData, ends: [string, string, string?], kind?: string): FlowConnectContext {
	const graph = buildFlowGraph(data)
	return {
		source: graph.nodes.get(ends[0]) as never,
		target: graph.nodes.get(ends[1]) as never,
		kind,
		data,
		graph,
	} as FlowConnectContext
}

export function verdictOf(notation: FlowNotation, data: FlowMapData, ends: [string, string, string?]): FlowRuleResult {
	return notation.rules?.canConnect?.(connectContext(data, ends, ends[2])) as FlowRuleResult
}

export function issuesOf(notation: FlowNotation, data: FlowMapData) {
	return notation.rules?.validate?.(data, buildFlowGraph(data)) ?? []
}

export function layoutOf(notation: FlowNotation, data: FlowMapData, layout: FlowLayoutSettings = {}) {
	return runFlowLayout(createScope({ ...data, notation: notation.id }, { notation, layout }))
}

function overlaps(first: FlowRect, second: FlowRect): boolean {
	return (
		first.x < second.x + second.width &&
		second.x < first.x + first.width &&
		first.y < second.y + second.height &&
		second.y < first.y + first.height
	)
}

export function hasOverlaps(rects: readonly FlowRect[]): boolean {
	return rects.some((rect, index) => rects.slice(index + 1).some(other => overlaps(rect, other)))
}

export function isInside(inner: FlowRect, outer: FlowRect): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

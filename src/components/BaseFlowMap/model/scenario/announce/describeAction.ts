import { formatDuration } from './formatDuration'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowScenarioAction } from '../../../types/data/flowScenario.types'
import type { FlowActionEnds } from '../../../types/internal/flowScenarioLayer.types'

export function actionEnds(action: FlowScenarioAction, graph: FlowGraph): FlowActionEnds {
	const edge = action.edge ? graph.edges.get(action.edge) : undefined
	if (edge) {
		return { from: graph.nodes.get(edge.source)?.label ?? edge.source, to: graph.nodes.get(edge.target)?.label ?? edge.target }
	}
	const node = action.node ? graph.nodes.get(action.node) : undefined
	return node ? { to: node.label } : {}
}

export function actionLatency(action: FlowScenarioAction): string {
	return action.latency === undefined ? '' : formatDuration(action.latency)
}

export function actionTitle(ends: FlowActionEnds): string {
	return [ends.from, ends.to].filter(Boolean).join(' → ')
}

export function actionDetail(action: FlowScenarioAction): string {
	return [action.label, action.via].filter(Boolean).join(' · ')
}

export function describeAction(action: FlowScenarioAction, graph: FlowGraph): string {
	const parts = [actionTitle(actionEnds(action, graph)), action.label, action.via, actionLatency(action)]
	return parts.filter(Boolean).join(', ')
}

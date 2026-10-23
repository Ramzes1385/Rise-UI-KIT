import { UI_FLOW_BPMN } from '@/locales/messages'
import { simulateTokens } from '../../scenario/simulateTokens'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowNode } from '../../../types/data/flowData.types'
import type { FlowGatewaySemantics } from '../../../types/api/flowNotation.types'
import type { FlowScenario, FlowScenarioChoices } from '../../../types/data/flowScenario.types'

export const BPMN_GATEWAYS: Record<string, FlowGatewaySemantics> = {
	parallel: { split: 'all', join: 'all' },
	exclusive: { split: 'one', join: 'one' },
	inclusive: { split: 'some', join: 'some' },
	'event-based': { split: 'one', join: 'one' },
	complex: { split: 'some', join: 'some' },
}

function isFlow(edge: FlowEdge): boolean {
	const kind = edge.kind ?? 'sequence'
	return kind === 'sequence' || kind === 'message'
}

function isMessage(edge: FlowEdge): boolean {
	return edge.kind === 'message'
}

function isStart(node: FlowNode, graph: FlowGraph): boolean {
	return node.kind === 'start' && graph.incoming(node.id).filter(isFlow).length === 0
}

export function simulateBpmn(graph: FlowGraph, choices: FlowScenarioChoices): FlowScenario | null {
	return simulateTokens(graph, choices, {
		id: 'bpmn-simulation',
		label: UI_FLOW_BPMN.SIMULATION,
		gateways: BPMN_GATEWAYS,
		follow: isFlow,
		isStart,
		isSignal: isMessage,
	})
}

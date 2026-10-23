import { EPC_GATEWAYS } from './epcKinds'
import { UI_FLOW_EPC } from '@/locales/messages'
import { simulateTokens } from '../../scenario/simulateTokens'
import { alternationOf, isAside, isControl } from './epcRules'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowScenario, FlowScenarioChoices } from '../../../types/data/flowScenario.types'

function isStart(node: FlowNode, graph: FlowGraph): boolean {
	if (isAside(node) || alternationOf(node) === 'function') return false
	return graph.incoming(node.id).filter(isControl).length === 0
}

export function simulateEpc(graph: FlowGraph, choices: FlowScenarioChoices): FlowScenario | null {
	return simulateTokens(graph, choices, {
		id: 'epc-simulation',
		label: UI_FLOW_EPC.SIMULATION,
		gateways: EPC_GATEWAYS,
		follow: isControl,
		isStart,
	})
}

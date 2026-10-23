import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import type { FlowEdge } from '../../../types/data/flowData.types'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowScenario, FlowScenarioAction, FlowScenarioChoices } from '../../../types/data/flowScenario.types'

function actionOf(edge: FlowEdge, index: number): FlowScenarioAction {
	const latency = edge.props?.latency
	return {
		id: `sequence-${index + 1}`,
		edge: edge.id,
		label: edge.label,
		via: edge.kind,
		latency: typeof latency === 'number' ? latency : undefined,
	}
}

export function simulateSequence(graph: FlowGraph, _choices: FlowScenarioChoices): FlowScenario | null {
	const edges = [...graph.edges.values()]
	if (!edges.length) return null
	return { id: 'sequence-simulation', label: UI_FLOW_SEQUENCE.SIMULATION, steps: edges.map(actionOf), timing: 'latency' }
}

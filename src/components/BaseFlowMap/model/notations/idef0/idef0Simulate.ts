import { UI_FLOW_IDEF } from '@/locales/messages'
import { codeOrder, idef0KindOf, portRole } from './idef0Rules'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowNode } from '../../../types/data/flowData.types'
import type { IdefDraftStep } from '../../../types/notations/process/idef.types'
import type { FlowScenario, FlowScenarioChoices } from '../../../types/data/flowScenario.types'

const MAX_STEPS = 200

function functionsInOrder(graph: FlowGraph): FlowNode[] {
	const functions = [...graph.nodes.values()].filter(node => idef0KindOf(node) === 'function')
	const key = (node: FlowNode): number => codeOrder(typeof node.props?.code === 'string' ? node.props.code : '')
	return functions.sort((a, b) => key(a) - key(b))
}

function isGuide(edge: FlowEdge, graph: FlowGraph): boolean {
	const target = graph.nodes.get(edge.target)
	const role = target ? portRole(target, edge.targetPort) : undefined
	return role === 'control' || role === 'mechanism'
}

function edgeStep(edge: FlowEdge, graph: FlowGraph): IdefDraftStep {
	const label = edge.label ?? graph.nodes.get(edge.source)?.label
	return { edge: edge.id, label, effect: isGuide(edge, graph) ? 'draw' : 'travel' }
}

function functionSteps(node: FlowNode, graph: FlowGraph, done: Set<string>): IdefDraftStep[] {
	const fresh = (edges: readonly FlowEdge[]): FlowEdge[] => edges.filter(edge => !done.has(edge.id))
	const incoming = fresh(graph.incoming(node.id))
	incoming.forEach(edge => done.add(edge.id))
	const outgoing = fresh(graph.outgoing(node.id))
	outgoing.forEach(edge => done.add(edge.id))
	return [
		...incoming.map(edge => edgeStep(edge, graph)),
		{ node: node.id, label: node.label, effect: 'pulse' },
		...outgoing.map(edge => edgeStep(edge, graph)),
	]
}

export function idef0Simulate(graph: FlowGraph, _choices: FlowScenarioChoices): FlowScenario | null {
	const functions = functionsInOrder(graph)
	if (!functions.length) return null
	const done = new Set<string>()
	const drafts = functions.flatMap(node => functionSteps(node, graph, done)).slice(0, MAX_STEPS)
	return {
		id: 'idef0-simulation',
		label: UI_FLOW_IDEF.SIMULATION,
		steps: drafts.map((draft, index) => ({ ...draft, id: `s${index + 1}` })),
	}
}

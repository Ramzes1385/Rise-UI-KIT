import { idef3Gateways } from './idef3Kinds'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { idef3KindOf, isFlowEdge } from './idef3Rules'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowNode } from '../../../types/data/flowData.types'
import type { FlowScenario, FlowScenarioChoices } from '../../../types/data/flowScenario.types'
import type { Idef3Junction, Idef3Run, IdefDraftStep } from '../../../types/notations/process/idef.types'

const MAX_STEPS = 200

function flowOut(graph: FlowGraph, node: FlowNode): FlowEdge[] {
	return graph.outgoing(node.id).filter(isFlowEdge)
}

function flowIn(graph: FlowGraph, node: FlowNode): FlowEdge[] {
	return graph.incoming(node.id).filter(isFlowEdge)
}

function nextId(run: Idef3Run, prefix: string): string {
	run.counter += 1
	return `${prefix}${run.counter}`
}

function emitGroup(run: Idef3Run, drafts: IdefDraftStep[]): void {
	if (!drafts.length) return
	const leaves = drafts.map(draft => ({ ...draft, id: nextId(run, 's') }))
	run.steps.push(leaves.length === 1 ? leaves[0]! : { type: 'parallel', id: nextId(run, 'p'), branches: leaves.map(leaf => [leaf]) })
}

function chooseEdge(run: Idef3Run, node: FlowNode, edges: FlowEdge[]): FlowEdge[] {
	const chosen = run.choices[node.id]
	const pick = edges.find(edge => edge.id === chosen) ?? edges.find(edge => edge.isDefault) ?? edges[0]
	return pick ? [pick] : []
}

function release(run: Idef3Run, node: FlowNode): FlowEdge[] {
	const edges = flowOut(run.graph, node)
	const semantics = idef3Gateways[idef3KindOf(node) as Idef3Junction]
	return semantics?.split === 'one' ? chooseEdge(run, node, edges) : edges
}

function isReady(run: Idef3Run, node: FlowNode): boolean {
	if (run.fired.has(node.id)) return false
	const semantics = idef3Gateways[idef3KindOf(node) as Idef3Junction]
	const needed = semantics?.join === 'all' ? flowIn(run.graph, node).length : 1
	return run.arrived.get(node.id)! >= needed
}

function nodeStep(node: FlowNode): IdefDraftStep {
	return { node: node.id, label: node.label || undefined, effect: 'pulse' }
}

function edgeStep(edge: FlowEdge): IdefDraftStep {
	return { edge: edge.id, label: edge.label ?? edge.condition, effect: 'travel' }
}

function arrive(run: Idef3Run, edges: FlowEdge[]): FlowNode[] {
	const ready: FlowNode[] = []
	for (const edge of edges) {
		const target = run.graph.nodes.get(edge.target)
		if (!target || idef3KindOf(target) === 'referent') continue
		run.arrived.set(target.id, (run.arrived.get(target.id) ?? 0) + 1)
		if (isReady(run, target) && !ready.includes(target)) ready.push(target)
	}
	ready.forEach(node => run.fired.add(node.id))
	return ready
}

function startNodes(graph: FlowGraph): FlowNode[] {
	return [...graph.nodes.values()].filter(
		node => idef3KindOf(node) !== 'referent' && !flowIn(graph, node).length && flowOut(graph, node).length,
	)
}

function walk(run: Idef3Run, starts: FlowNode[]): void {
	starts.forEach(node => run.fired.add(node.id))
	emitGroup(run, starts.map(nodeStep))
	let wave = starts.flatMap(node => release(run, node))
	while (wave.length && run.counter < MAX_STEPS) {
		emitGroup(run, wave.map(edgeStep))
		const ready = arrive(run, wave)
		emitGroup(run, ready.map(nodeStep))
		wave = ready.flatMap(node => release(run, node))
	}
}

export function idef3Simulate(graph: FlowGraph, choices: FlowScenarioChoices): FlowScenario | null {
	const starts = startNodes(graph)
	if (!starts.length) return null
	const run: Idef3Run = { graph, choices, arrived: new Map(), fired: new Set(), steps: [], counter: 0 }
	walk(run, starts)
	return { id: 'idef3-simulation', label: UI_FLOW_IDEF.SIMULATION, steps: run.steps }
}

import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import type { FlowGatewaySemantics } from '../../types/api/flowNotation.types'
import { FLOW_SIMULATION_MAX_STEPS } from '../../types/internal/flowScenarioInternal.types'
import type { FlowScenario, FlowScenarioAction, FlowScenarioChoices, FlowScenarioStep } from '../../types/data/flowScenario.types'
import type { FlowSimulationConfig, FlowSimulationMove, FlowSimulationRun } from '../../types/internal/flowScenarioInternal.types'

const DEFAULT_SEMANTICS: FlowGatewaySemantics = { split: 'all', join: 'one' }

function outgoingOf(run: FlowSimulationRun, node: string): FlowEdge[] {
	return run.graph.outgoing(node).filter(run.follow)
}

function incomingOf(run: FlowSimulationRun, node: string): FlowEdge[] {
	return run.graph.incoming(node).filter(run.follow)
}

function semanticsOf(run: FlowSimulationRun, node: FlowNode): FlowGatewaySemantics {
	return run.config.gateways[node.kind] ?? DEFAULT_SEMANTICS
}

function matches(edge: FlowEdge, key: string): boolean {
	return edge.id === key || edge.target === key || edge.condition === key || edge.label === key
}

function chooseOne(run: FlowSimulationRun, node: FlowNode, edges: FlowEdge[]): FlowEdge[] {
	const forced = edges.find(edge => matches(edge, run.choices[node.id] ?? ''))
	const fallback = edges.find(edge => edge.isDefault) ?? edges.find(edge => !run.visited.has(edge.target)) ?? edges[0]
	return [forced ?? fallback]
}

function chooseSome(run: FlowSimulationRun, node: FlowNode, edges: FlowEdge[]): FlowEdge[] {
	const keys = (run.choices[node.id] ?? '').split(',').filter(Boolean)
	const forced = edges.filter(edge => keys.some(key => matches(edge, key)))
	if (forced.length > 0) {
		return forced
	}
	const conditional = edges.filter(edge => edge.condition !== undefined && !edge.isDefault)
	return conditional.length > 0 ? conditional : chooseOne(run, node, edges)
}

function chooseOutgoing(run: FlowSimulationRun, node: FlowNode): FlowEdge[] {
	const edges = outgoingOf(run, node.id)
	const split = semanticsOf(run, node).split
	if (edges.length <= 1 || split === 'all') {
		return edges
	}
	return split === 'one' ? chooseOne(run, node, edges) : chooseSome(run, node, edges)
}

function hasPendingUpstream(run: FlowSimulationRun, node: string, moves: readonly FlowSimulationMove[]): boolean {
	if (moves.some(move => move.node.id === node)) {
		return true
	}
	const seen = new Set<string>([node])
	const queue = [...run.waiting.keys(), ...run.ready, ...moves.map(move => move.node.id)].filter(id => id !== node)
	while (queue.length > 0) {
		const id = queue.shift() as string
		if (!seen.has(id)) {
			seen.add(id)
			const targets = outgoingOf(run, id).map(edge => edge.target)
			if (targets.includes(node)) {
				return true
			}
			queue.push(...targets)
		}
	}
	return false
}

function takeOnePerEdge(run: FlowSimulationRun, node: string, edges: FlowEdge[]): void {
	const counts = run.waiting.get(node)
	edges.forEach(edge => {
		const left = (counts?.get(edge.id) ?? 0) - 1
		if (left > 0) {
			counts?.set(edge.id, left)
		} else {
			counts?.delete(edge.id)
		}
	})
}

function joinOne(run: FlowSimulationRun, node: string, counts: Map<string, number>): number {
	const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
	run.waiting.delete(node)
	return total
}

function joinAll(run: FlowSimulationRun, node: string, counts: Map<string, number>): number {
	const incoming = incomingOf(run, node)
	const isReady = incoming.every(edge => counts.has(edge.id))
	takeOnePerEdge(run, node, isReady ? incoming : [])
	return isReady ? 1 : 0
}

function joinSome(run: FlowSimulationRun, node: string, moves: readonly FlowSimulationMove[]): number {
	if (hasPendingUpstream(run, node, moves)) {
		return 0
	}
	run.waiting.delete(node)
	return 1
}

function takeFirings(run: FlowSimulationRun, node: FlowNode, moves: readonly FlowSimulationMove[]): number {
	const counts = run.waiting.get(node.id)
	if (!counts || counts.size === 0) {
		return 0
	}
	const join = semanticsOf(run, node).join
	if (join === 'one') {
		return joinOne(run, node.id, counts)
	}
	return join === 'all' ? joinAll(run, node.id, counts) : joinSome(run, node.id, moves)
}

function fire(run: FlowSimulationRun, node: FlowNode): FlowSimulationMove[] {
	run.visited.add(node.id)
	return chooseOutgoing(run, node).flatMap(edge => {
		const target = run.graph.nodes.get(edge.target)
		return target ? [{ edge, node: target }] : []
	})
}

function collectMoves(run: FlowSimulationRun): FlowSimulationMove[] {
	const moves = run.ready.splice(0).flatMap(id => {
		const node = run.graph.nodes.get(id)
		return node ? fire(run, node) : []
	})
	run.graph.nodes.forEach(node => {
		const firings = takeFirings(run, node, moves)
		for (let index = 0; index < firings; index += 1) {
			moves.push(...fire(run, node))
		}
	})
	return moves
}

function isAbsorbed(run: FlowSimulationRun, edge: FlowEdge, node: FlowNode): boolean {
	const isSignal = run.config.isSignal
	if (!isSignal?.(edge)) {
		return false
	}
	return incomingOf(run, node.id).some(incoming => !isSignal(incoming))
}

function deliver(run: FlowSimulationRun, moves: FlowSimulationMove[]): void {
	moves.forEach(({ edge, node }) => {
		if (isAbsorbed(run, edge, node)) {
			return
		}
		const counts = run.waiting.get(node.id) ?? new Map<string, number>()
		counts.set(edge.id, (counts.get(edge.id) ?? 0) + 1)
		run.waiting.set(node.id, counts)
	})
}

function toAction(run: FlowSimulationRun, move: FlowSimulationMove): FlowScenarioAction {
	run.steps += 1
	return { id: `${run.config.id}-${run.steps}`, edge: move.edge.id, label: move.edge.label ?? move.node.label, status: move.edge.status }
}

function roundStep(run: FlowSimulationRun, moves: FlowSimulationMove[], round: number): FlowScenarioStep {
	const actions = moves.map(move => toAction(run, move))
	if (actions.length === 1) {
		return actions[0]
	}
	return { type: 'parallel', id: `${run.config.id}-p${round}`, branches: actions.map(action => [action]) }
}

function createRun(graph: FlowGraph, choices: FlowScenarioChoices, config: FlowSimulationConfig): FlowSimulationRun {
	const run: FlowSimulationRun = {
		graph,
		choices,
		config,
		follow: config.follow ?? (() => true),
		waiting: new Map(),
		ready: [],
		visited: new Set(),
		steps: 0,
	}
	const isStart = config.isStart ?? ((node: FlowNode) => incomingOf(run, node.id).length === 0 && outgoingOf(run, node.id).length > 0)
	graph.nodes.forEach(node => {
		if (isStart(node, graph)) {
			run.ready.push(node.id)
		}
	})
	return run
}

export function simulateTokens(graph: FlowGraph, choices: FlowScenarioChoices, config: FlowSimulationConfig): FlowScenario | null {
	const run = createRun(graph, choices, config)
	const limit = config.maxSteps ?? FLOW_SIMULATION_MAX_STEPS
	const steps: FlowScenarioStep[] = []
	for (let round = 1; run.steps < limit; round += 1) {
		const moves = collectMoves(run).slice(0, limit - run.steps)
		if (moves.length === 0) {
			break
		}
		deliver(run, moves)
		steps.push(roundStep(run, moves, round))
	}
	return steps.length > 0 ? { id: config.id, label: config.label, steps } : null
}

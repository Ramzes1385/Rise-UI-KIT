import { buildFlowGraph } from '../data/flowGraph'
import { findPort, removalChanges } from './flowRules'
import type { FlowScenario } from '../../types/data/flowScenario.types'
import type { FlowCommandEnv } from '../../types/internal/core/flowModelCore.types'
import type { FlowEdge, FlowGroup, FlowNode } from '../../types/data/flowData.types'
import type { FlowChange, FlowChangeSource } from '../../types/data/flowReview.types'
import type { FlowBefore, FlowEditTarget } from '../../types/internal/core/flowCommandInternal.types'

export function createCreateBefore(entity: 'node' | 'group', source: FlowChangeSource): FlowBefore {
	return async (hooks, changes) => {
		const change = changes[0]
		if (change?.type !== 'add') return changes
		const value = change.value as FlowNode | FlowGroup | FlowScenario
		const outcome = await hooks.run('beforeCreate', { entity, value, source }, value)
		return outcome.isCancelled ? null : [{ ...change, value: outcome.value }]
	}
}

export function createLabelBefore(target: FlowEditTarget): FlowBefore {
	return async (hooks, changes) => {
		const change = changes[0]
		if (change?.type !== 'update') return changes
		const value = String(change.patch.label ?? '')
		const previous = String(change.previous.label ?? '')
		const outcome = await hooks.run('beforeEditLabel', { target: { entity: target.entity, id: target.id }, value, previous }, value)
		return outcome.isCancelled ? null : [{ ...change, patch: { ...change.patch, label: outcome.value } }]
	}
}

export function createDeleteBefore(source: FlowChangeSource): FlowBefore {
	return async (hooks, changes, data) => {
		const values = { nodes: [] as FlowNode[], edges: [] as FlowEdge[], groups: [] as FlowGroup[] }
		for (const change of changes) {
			if (change.type !== 'remove') continue
			if (change.entity === 'node') values.nodes.push(change.value as FlowNode)
			if (change.entity === 'edge') values.edges.push(change.value as FlowEdge)
			if (change.entity === 'group') values.groups.push(change.value as FlowGroup)
		}
		const outcome = await hooks.run('beforeDelete', { ...values, source }, values)
		return outcome.isCancelled ? null : removalChanges(data, outcome.value)
	}
}

export function createConnectBefore(env: FlowCommandEnv): FlowBefore {
	return async (hooks, changes, data) => {
		const change: FlowChange | undefined = changes[0]
		if (change?.type !== 'add') return changes
		const edge = change.value as FlowEdge
		const source = data.nodes.find(node => node.id === edge.source)
		const target = data.nodes.find(node => node.id === edge.target)
		if (!source || !target) return changes
		const context = {
			source,
			target,
			sourcePort: findPort(env, source, edge.sourcePort),
			targetPort: findPort(env, target, edge.targetPort),
			kind: edge.kind ?? env.notation().defaultEdgeKind,
			data,
			graph: buildFlowGraph(data),
			edge,
		}
		const outcome = await hooks.run('beforeConnect', context, edge)
		return outcome.isCancelled ? null : [{ ...change, value: outcome.value }]
	}
}

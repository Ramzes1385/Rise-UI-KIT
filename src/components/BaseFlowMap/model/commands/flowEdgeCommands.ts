import { checkConnection } from './flowRules'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { duplicateOf, missingOf } from './flowRules'
import { createConnectBefore } from './flowCommandHooks'
import { collectFlowIds, createFlowId } from '../data/flowIds'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowCommand } from '../../types/internal/flowModel.types'
import type { FlowRejectEvent } from '../../types/api/flowController.types'
import type { FlowEdge, FlowMapData } from '../../types/data/flowData.types'
import type { FlowCommandEnv } from '../../types/internal/core/flowModelCore.types'
import type { FlowEnd, FlowPatch } from '../../types/internal/core/flowCommandInternal.types'

function labelOf(data: FlowMapData, id: string): string {
	return data.nodes.find(node => node.id === id)?.label ?? id
}

function verify(edge: FlowEdge, env: FlowCommandEnv, state: { data: FlowMapData; graph: FlowGraph }): FlowRejectEvent | null {
	const source = state.data.nodes.find(node => node.id === edge.source)
	const target = state.data.nodes.find(node => node.id === edge.target)
	if (!source || !target) return missingOf('connect', source ? edge.target : edge.source)
	const kind = edge.kind ?? env.notation().defaultEdgeKind
	return checkConnection({
		env,
		...state,
		source,
		target,
		sourcePort: edge.sourcePort,
		targetPort: edge.targetPort,
		kind,
		edgeId: edge.id,
	})
}

export function addEdgeCommand(edge: FlowEdge, env: FlowCommandEnv, data: FlowMapData): FlowCommand {
	const label = formatMessage(UI_FLOW_MAP.CMD_CONNECT, { source: labelOf(data, edge.source), target: labelOf(data, edge.target) })
	return {
		name: 'connect',
		label,
		source: env.source,
		build: (fresh, graph) => {
			if (collectFlowIds(fresh).has(edge.id)) return duplicateOf('connect', edge.id)
			return verify(edge, env, { data: fresh, graph }) ?? [{ type: 'add', entity: 'edge', value: edge }]
		},
		before: createConnectBefore(env),
	}
}

export function updateEdgeRulesCommand(id: string, patch: FlowPatch, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'update',
		label: formatMessage(UI_FLOW_MAP.CMD_UPDATE, { label: String(patch.label ?? id) }),
		source: env.source,
		build: (data, graph) => {
			const edge = data.edges.find(item => item.id === id)
			if (!edge) return missingOf('update', id)
			const merged = { ...edge, ...patch } as FlowEdge
			const touchesEnds = ['source', 'target', 'sourcePort', 'targetPort', 'kind'].some(key => key in patch)
			const rejected = touchesEnds ? verify(merged, env, { data, graph }) : null
			const previous = Object.fromEntries(Object.keys(patch).map(key => [key, (edge as unknown as FlowPatch)[key]]))
			return rejected ?? [{ type: 'update', entity: 'edge', id, patch, previous }]
		},
	}
}

function endOf(end: FlowEnd): { node: string; port?: string } {
	return typeof end === 'string' ? { node: end } : end
}

export function connectEdgeOf(
	context: { data: FlowMapData; env: FlowCommandEnv },
	ends: [FlowEnd, FlowEnd],
	extra?: Partial<FlowEdge>,
): FlowEdge {
	const [from, to] = [endOf(ends[0]), endOf(ends[1])]
	return {
		...extra,
		id: extra?.id ?? createFlowId('e', collectFlowIds(context.data)),
		kind: extra?.kind ?? context.env.notation().defaultEdgeKind,
		source: from.node,
		target: to.node,
		sourcePort: from.port ?? extra?.sourcePort,
		targetPort: to.port ?? extra?.targetPort,
	}
}

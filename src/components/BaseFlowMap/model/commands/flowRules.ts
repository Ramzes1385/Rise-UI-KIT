import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowChange } from '../../types/data/flowReview.types'
import { parseKindRef, resolveNodeKind } from '../notations/resolveKind'
import type { FlowRejectEvent } from '../../types/api/flowController.types'
import type { FlowConnectionRule } from '../../types/api/flowNotation.types'
import type { FlowCommandEnv } from '../../types/internal/core/flowModelCore.types'
import type { FlowConnectCheck } from '../../types/internal/core/flowCommandInternal.types'
import type { FlowGroup, FlowMapData, FlowNode, FlowPort } from '../../types/data/flowData.types'
import type { FlowDataItem, FlowEditable, FlowRemoval } from '../../types/internal/core/flowCommandInternal.types'

const COMMAND = 'connect'

function reject(by: FlowRejectEvent['by'], message: string, code?: string): FlowRejectEvent {
	return { command: COMMAND, by, message, code }
}

function matches(list: readonly string[], kind: string): boolean {
	return list.includes('*') || list.includes(kind) || list.includes(parseKindRef(kind).kind)
}

function poolOf(check: FlowConnectCheck, node: FlowNode): string | undefined {
	return check.graph.ancestry(node.id).find(group => group.kind === 'pool')?.id
}

function poolsAllow(rule: FlowConnectionRule, check: FlowConnectCheck): FlowRejectEvent | null {
	if (!rule.pools) return null
	const isSame = poolOf(check, check.source) === poolOf(check, check.target)
	if (rule.pools === 'same' && !isSame) return reject('rule', UI_FLOW_MAP.REJECT_POOLS_SAME, 'pools-same')
	if (rule.pools === 'different' && isSame) return reject('rule', UI_FLOW_MAP.REJECT_POOLS_DIFFERENT, 'pools-different')
	return null
}

function tableAllows(check: FlowConnectCheck): FlowRejectEvent | null {
	const table = check.env.notation().rules?.connections
	if (!table) return null
	const { source, target, kind } = check
	const rule = table.find(item => item.edge === kind && matches(item.from, source.kind) && matches(item.to, target.kind))
	if (rule) return poolsAllow(rule, check)
	const message = formatMessage(UI_FLOW_MAP.REJECT_CONNECTION, { kind, from: source.label, to: target.label })
	return reject('rule', message, 'connection-not-allowed')
}

function portAllows(end: { node: FlowNode; port: FlowPort | undefined; isOut: boolean }, check: FlowConnectCheck): FlowRejectEvent | null {
	const { node, port, isOut } = end
	if (!port) return null
	const params = { node: node.label, port: port.label ?? port.id }
	if (port.direction && port.direction !== 'both' && port.direction !== (isOut ? 'out' : 'in')) {
		return reject('rule', formatMessage(UI_FLOW_MAP.REJECT_PORT_DIRECTION, params), 'port-direction')
	}
	const used = check.data.edges.filter(
		edge =>
			edge.id !== check.edgeId &&
			(isOut ? edge.source : edge.target) === node.id &&
			(isOut ? edge.sourcePort : edge.targetPort) === port.id,
	)
	if (port.maxEdges === undefined || used.length < port.maxEdges) return null
	return reject('limit', formatMessage(UI_FLOW_MAP.REJECT_PORT_FULL, { ...params, max: port.maxEdges }), 'port-full')
}

function customAllows(check: FlowConnectCheck, sourcePort?: FlowPort, targetPort?: FlowPort): FlowRejectEvent | null {
	const verdict = check.env.notation().rules?.canConnect?.({
		source: check.source,
		target: check.target,
		sourcePort,
		targetPort,
		kind: check.kind,
		data: check.data,
		graph: check.graph,
	})
	return verdict === undefined || verdict === true ? null : reject('rule', verdict.message, verdict.code)
}

export function checkConnection(check: FlowConnectCheck): FlowRejectEvent | null {
	const sourcePort = findPort(check.env, check.source, check.sourcePort)
	const targetPort = findPort(check.env, check.target, check.targetPort)
	return (
		tableAllows(check) ??
		portAllows({ node: check.source, port: sourcePort, isOut: true }, check) ??
		portAllows({ node: check.target, port: targetPort, isOut: false }, check) ??
		customAllows(check, sourcePort, targetPort)
	)
}

export function duplicateOf(command: string, id: string): FlowRejectEvent {
	return { command, by: 'limit', message: formatMessage(UI_FLOW_MAP.REJECT_DUPLICATE, { id }), code: 'duplicate-id' }
}

export function missingOf(command: string, id: string): FlowRejectEvent {
	return { command, by: 'limit', message: formatMessage(UI_FLOW_MAP.REJECT_NOT_FOUND, { id }), code: 'not-found' }
}

export function checkContain(env: FlowCommandEnv, graph: FlowGraph, node: FlowNode): FlowRejectEvent | null {
	const group = node.group === undefined ? null : (graph.groups.get(node.group) ?? null)
	const verdict = env.notation().rules?.canContain?.(group, node)
	if (verdict === undefined || verdict === true) return null
	return { command: 'contain', by: 'rule', message: verdict.message, code: verdict.code }
}

export function dropOf(
	groups: readonly FlowGroup[],
	ids: ReadonlySet<string>,
	parentOf: (group: FlowGroup) => string | undefined,
): FlowGroup[] {
	const dropped = new Set(groups.filter(group => ids.has(group.id)).map(group => group.id))
	let isGrowing = true
	while (isGrowing) {
		isGrowing = false
		for (const group of groups) {
			const parent = parentOf(group)
			if (parent !== undefined && dropped.has(parent) && !dropped.has(group.id)) {
				dropped.add(group.id)
				isGrowing = true
			}
		}
	}
	return groups.filter(group => dropped.has(group.id))
}

export function findPort(env: FlowCommandEnv, node: FlowNode, portId: string | undefined): FlowPort | undefined {
	if (!portId) return undefined
	const kind = resolveNodeKind(node.kind, env.notation(), env.registry())
	return (node.ports ?? kind.ports)?.find(port => port.id === portId)
}

function removeChanges(entity: FlowEditable, list: readonly FlowDataItem[], items: readonly FlowDataItem[]): FlowChange[] {
	return items
		.map(item => ({ item, index: list.findIndex(other => other.id === item.id) }))
		.sort((left, right) => right.index - left.index)
		.map(({ item, index }) => ({ type: 'remove' as const, entity, id: item.id, value: item, index }))
}

export function removalChanges(data: FlowMapData, removal: FlowRemoval): FlowChange[] {
	return [
		...removeChanges('edge', data.edges, removal.edges),
		...removeChanges('node', data.nodes, removal.nodes),
		...removeChanges('group', data.groups ?? [], removal.groups),
	]
}

import { buildFlowGraph } from './flowGraph'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { findNodeKind } from '../notations/resolveKind'
import type { FlowEntity } from '../../types/data/flowReview.types'
import type { FlowDataIssue, FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowPort } from '../../types/data/flowData.types'

const ENTITY_LABELS: Record<FlowEntity, () => string> = {
	node: () => UI_FLOW_MAP.ENTITY_NODE,
	edge: () => UI_FLOW_MAP.ENTITY_EDGE,
	group: () => UI_FLOW_MAP.ENTITY_GROUP,
	scenario: () => UI_FLOW_MAP.ENTITY_SCENARIO,
}

function error(code: string, message: string, target?: FlowDataIssue['target']): FlowDataIssue {
	return { level: 'error', code, message, target }
}

function duplicates(entity: FlowEntity, list: readonly { id: string }[]): FlowDataIssue[] {
	const seen = new Set<string>()
	const issues: FlowDataIssue[] = []
	for (const { id } of list) {
		if (seen.has(id)) {
			const message = formatMessage(UI_FLOW_MAP.ISSUE_DUPLICATE_ID, { id, entity: ENTITY_LABELS[entity]() })
			issues.push(error('duplicate-id', message, { entity, id }))
		}
		seen.add(id)
	}
	return issues
}

function portsOf(node: FlowNode, notation: FlowNotation | undefined, registry: ReadonlyMap<string, FlowNotation>) {
	if (node.ports) return node.ports
	return notation ? findNodeKind(node.kind, notation, registry)?.ports : undefined
}

function hasPort(ports: readonly FlowPort[] | undefined, id: string | undefined): boolean {
	return id === undefined || ports === undefined || ports.some(port => port.id === id)
}

function edgeIssues(edge: FlowEdge, check: (id: string) => FlowNode | undefined, ports: (node: FlowNode) => FlowPort[] | undefined) {
	const issues: FlowDataIssue[] = []
	const target = { entity: 'edge', id: edge.id } as const
	for (const [nodeId, portId] of [
		[edge.source, edge.sourcePort],
		[edge.target, edge.targetPort],
	] as const) {
		const node = check(nodeId)
		if (!node) {
			issues.push(error('missing-node', formatMessage(UI_FLOW_MAP.ISSUE_MISSING_NODE, { edge: edge.id, node: nodeId }), target))
		} else if (!hasPort(ports(node), portId)) {
			const message = formatMessage(UI_FLOW_MAP.ISSUE_MISSING_PORT, { edge: edge.id, node: nodeId, port: portId as string })
			issues.push(error('missing-port', message, target))
		}
	}
	return issues
}

function groupIssues(group: FlowGroup, groups: ReadonlyMap<string, FlowGroup>): FlowDataIssue[] {
	const target = { entity: 'group', id: group.id } as const
	if (group.parent !== undefined && !groups.has(group.parent)) {
		return [error('missing-group', formatMessage(UI_FLOW_MAP.ISSUE_MISSING_GROUP, { group: group.parent, target: group.id }), target)]
	}
	const seen = new Set([group.id])
	let current = group.parent === undefined ? undefined : groups.get(group.parent)
	while (current) {
		if (seen.has(current.id)) return [error('group-cycle', formatMessage(UI_FLOW_MAP.ISSUE_GROUP_CYCLE, { group: group.id }), target)]
		seen.add(current.id)
		current = current.parent === undefined ? undefined : groups.get(current.parent)
	}
	return []
}

function nodeGroupIssues(node: FlowNode, groups: ReadonlyMap<string, FlowGroup>): FlowDataIssue[] {
	if (node.group === undefined || groups.has(node.group)) return []
	const message = formatMessage(UI_FLOW_MAP.ISSUE_MISSING_GROUP, { group: node.group, target: node.id })
	return [error('missing-group', message, { entity: 'node', id: node.id })]
}

function structureIssues(data: FlowMapData, notation: FlowNotation | undefined, registry: ReadonlyMap<string, FlowNotation>) {
	const graph = buildFlowGraph(data)
	const node = (id: string) => graph.nodes.get(id)
	const ports = (item: FlowNode) => portsOf(item, notation, registry) as FlowPort[] | undefined
	return [
		...duplicates('node', data.nodes),
		...duplicates('edge', data.edges),
		...duplicates('group', data.groups ?? []),
		...duplicates('scenario', data.scenarios ?? []),
		...data.edges.flatMap(edge => edgeIssues(edge, node, ports)),
		...[...graph.groups.values()].flatMap(group => groupIssues(group, graph.groups)),
		...data.nodes.flatMap(item => nodeGroupIssues(item, graph.groups)),
	]
}

export function validateFlowData(
	data: FlowMapData,
	notation?: FlowNotation,
	registry: ReadonlyMap<string, FlowNotation> = new Map(),
): FlowDataIssue[] {
	const rules = notation?.rules?.validate
	return [...structureIssues(data, notation, registry), ...(rules ? rules(data, buildFlowGraph(data)) : [])]
}

import { formatMessage } from '@/locales/state'
import { collectFlowIds } from '../data/flowIds'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowChange } from '../../types/data/flowReview.types'
import type { FlowCommand } from '../../types/internal/flowModel.types'
import type { FlowCommandEnv } from '../../types/internal/core/flowModelCore.types'
import { checkContain, dropOf, duplicateOf, missingOf, removalChanges } from './flowRules'
import { createCreateBefore, createDeleteBefore, createLabelBefore } from './flowCommandHooks'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowPoint } from '../../types/data/flowData.types'
import type { FlowDataItem, FlowEditTarget, FlowPatch } from '../../types/internal/core/flowCommandInternal.types'

const COLLECTION = { node: 'nodes', edge: 'edges', group: 'groups' } as const

function itemOf(data: FlowMapData, { entity, id }: FlowEditTarget): FlowDataItem | undefined {
	return (data[COLLECTION[entity]] as FlowDataItem[] | undefined)?.find(item => item.id === id)
}

function previousOf(item: FlowDataItem, patch: FlowPatch): FlowPatch {
	return Object.fromEntries(Object.keys(patch).map(key => [key, (item as unknown as FlowPatch)[key]]))
}

export function addNodeCommand(node: FlowNode, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'add-node',
		label: formatMessage(UI_FLOW_MAP.CMD_ADD_NODE, { label: node.label }),
		source: env.source,
		build: (data, graph) => {
			if (collectFlowIds(data).has(node.id)) return duplicateOf('add-node', node.id)
			const rejected = checkContain(env, graph, node)
			return rejected ?? [{ type: 'add', entity: 'node', value: node }]
		},
		before: createCreateBefore('node', env.source),
	}
}

export function addGroupCommand(group: FlowGroup, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'add-group',
		label: formatMessage(UI_FLOW_MAP.CMD_ADD_GROUP, { label: group.label }),
		source: env.source,
		build: data =>
			collectFlowIds(data).has(group.id) ? duplicateOf('add-group', group.id) : [{ type: 'add', entity: 'group', value: group }],
		before: createCreateBefore('group', env.source),
	}
}

export function updateCommand(target: FlowEditTarget, patch: FlowPatch, env: FlowCommandEnv): FlowCommand {
	const { entity, id } = target
	const isLabelOnly = Object.keys(patch).length === 1 && 'label' in patch
	const name = isLabelOnly ? 'update-label' : 'update'
	return {
		name,
		label: formatMessage(UI_FLOW_MAP.CMD_UPDATE, { label: String(patch.label ?? id) }),
		source: env.source,
		mergeKey: isLabelOnly ? `label:${id}` : undefined,
		build: (data, graph) => {
			const item = itemOf(data, target)
			if (!item) return missingOf(name, id)
			const rejected = entity === 'node' && 'group' in patch ? checkContain(env, graph, { ...(item as FlowNode), ...patch }) : null
			return rejected ?? [{ type: 'update', entity, id, patch, previous: previousOf(item, patch) }]
		},
		before: isLabelOnly ? createLabelBefore(target) : undefined,
	}
}

function collectRemoval(data: FlowMapData, ids: ReadonlySet<string>): { nodes: FlowNode[]; edges: FlowEdge[]; groups: FlowGroup[] } {
	const groups = dropOf(data.groups ?? [], ids, group => group.parent)
	const groupIds = new Set(groups.map(group => group.id))
	const nodes = data.nodes.filter(node => ids.has(node.id) || (node.group !== undefined && groupIds.has(node.group)))
	const nodeIds = new Set(nodes.map(node => node.id))
	const edges = data.edges.filter(edge => ids.has(edge.id) || nodeIds.has(edge.source) || nodeIds.has(edge.target))
	return { nodes, edges, groups }
}

export function removeCommand(ids: readonly string[], env: FlowCommandEnv): FlowCommand {
	return {
		name: 'delete',
		label: formatMessage(UI_FLOW_MAP.CMD_DELETE, { count: ids.length }),
		source: env.source,
		build: data => {
			const removal = collectRemoval(data, new Set(ids))
			const count = removal.nodes.length + removal.edges.length + removal.groups.length
			return count === 0 ? missingOf('delete', ids.join(', ')) : removalChanges(data, removal)
		},
		before: createDeleteBefore(env.source),
	}
}

function targetOf(by: FlowPoint | Record<string, FlowPoint>, id: string, from: FlowPoint | undefined): FlowPoint | undefined {
	if (typeof (by as FlowPoint).x === 'number')
		return from ? { x: from.x + (by as FlowPoint).x, y: from.y + (by as FlowPoint).y } : undefined
	return (by as Record<string, FlowPoint>)[id]
}

export function moveCommand(ids: readonly string[], by: FlowPoint | Record<string, FlowPoint>, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'move',
		label: formatMessage(UI_FLOW_MAP.CMD_MOVE, { count: ids.length }),
		source: env.source,
		mergeKey: `move:${[...ids].sort().join(',')}`,
		build: data => {
			const changes: FlowChange[] = []
			for (const id of ids) {
				const node = data.nodes.find(item => item.id === id)
				const position = targetOf(by, id, node?.position ?? env.positionOf(id))
				if (!node || !position) continue
				const patch = { position, isPinned: true }
				changes.push({ type: 'update', entity: 'node', id, patch, previous: previousOf(node, patch) })
			}
			return changes.length > 0 ? changes : missingOf('move', ids.join(', '))
		},
	}
}

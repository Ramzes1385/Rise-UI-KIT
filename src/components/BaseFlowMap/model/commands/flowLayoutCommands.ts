import { diffFlowData } from '../data/flowDiff'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { runFlowLayout } from '../layout/useFlowLayout'
import type { FlowCommand } from '../../types/internal/flowModel.types'
import type { FlowChange, FlowSuggestion } from '../../types/data/flowReview.types'
import type { FlowCommandEnv } from '../../types/internal/core/flowModelCore.types'
import type { FlowLayoutOptions } from '../../types/internal/core/flowCommandInternal.types'
import type { FlowLayoutSettings, FlowMapData, FlowNode, FlowPoint } from '../../types/data/flowData.types'

function isSamePoint(left: FlowPoint | undefined, right: FlowPoint): boolean {
	return left !== undefined && left.x === right.x && left.y === right.y
}

function nodeChange(node: FlowNode, position: FlowPoint, isForced: boolean): FlowChange | null {
	const isUnpin = isForced && node.isPinned === true
	if (isSamePoint(node.position, position) && !isUnpin) return null
	const patch: Record<string, unknown> = { position }
	const previous: Record<string, unknown> = { position: node.position }
	if (isUnpin) {
		patch.isPinned = undefined
		previous.isPinned = true
	}
	return { type: 'update', entity: 'node', id: node.id, patch, previous }
}

function rootChange(data: FlowMapData, settings: FlowLayoutSettings | undefined): FlowChange[] {
	if (!settings || Object.keys(settings).length === 0) return []
	return [{ type: 'root', patch: { layout: { ...data.layout, ...settings } }, previous: { layout: data.layout } }]
}

function positionsOf(data: FlowMapData, env: FlowCommandEnv): Map<string, FlowPoint> {
	return new Map(
		data.nodes.flatMap((node): [string, FlowPoint][] => {
			const point = env.positionOf(node.id)
			return point ? [[node.id, point]] : []
		}),
	)
}

export function layoutCommand(options: FlowLayoutOptions, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'layout',
		label: UI_FLOW_MAP.CMD_LAYOUT,
		source: 'layout',
		build: data => {
			const { ids, isForced = false, ...settings } = options
			const scope = { ...env.scope(), data: { ...data, layout: { ...data.layout, ...settings } } }
			const result = runFlowLayout(scope, { isForced, ids, current: positionsOf(data, env) })
			const targets = data.nodes.filter(node => (ids ? ids.includes(node.id) : isForced || !node.isPinned))
			const moves = targets.flatMap(node => {
				const rect = result.nodes[node.id]
				const change = rect ? nodeChange(node, { x: rect.x, y: rect.y }, isForced) : null
				return change ? [change] : []
			})
			return [...rootChange(data, settings), ...moves]
		},
	}
}

export function importCommand(imported: FlowMapData, env: FlowCommandEnv): FlowCommand {
	return {
		name: 'import',
		label: UI_FLOW_MAP.CMD_IMPORT,
		source: env.source,
		build: data => diffFlowData(data, imported),
	}
}

export function acceptCommand(suggestion: FlowSuggestion): FlowCommand {
	return {
		name: 'accept-proposal',
		label: formatMessage(UI_FLOW_MAP.CMD_ACCEPT, { label: suggestion.label ?? UI_FLOW_MAP.SUGGESTION_DEFAULT }),
		source: 'review',
		build: () => suggestion.changes,
	}
}

import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { flowReviewAdapter } from './flowReviewAdapter'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowChange } from '../../types/data/flowReview.types'
import type { ReviewChangeInfo } from '../../types/internal/review/reviewCore.types'

function nodeName(data: FlowMapData, id: string): string {
	return data.nodes.find(node => node.id === id)?.label ?? id
}

function edgeName(data: FlowMapData, value: { label?: string; source?: string; target?: string }): string {
	if (value.label) return value.label
	return value.source && value.target ? `${nodeName(data, value.source)} → ${nodeName(data, value.target)}` : ''
}

function listLabel(data: FlowMapData, entity: string, id: string): string | undefined {
	const list = entity === 'node' ? data.nodes : (data.groups ?? [])
	return list.find(item => item.id === id)?.label
}

export function elementName(info: Pick<ReviewChangeInfo, 'entity' | 'id' | 'value'>, data: FlowMapData): string {
	const value = (info.value ?? {}) as { label?: string; source?: string; target?: string }
	if (info.entity === 'edge') return edgeName(data, info.value ? value : (data.edges.find(item => item.id === info.id) ?? {})) || info.id
	return value.label ?? listLabel(data, info.entity, info.id) ?? info.id
}

const TITLES = {
	add: () => UI_FLOW_REVIEW.TITLE_ADD,
	remove: () => UI_FLOW_REVIEW.TITLE_REMOVE,
	move: () => UI_FLOW_REVIEW.TITLE_MOVE,
	update: () => UI_FLOW_REVIEW.TITLE_UPDATE,
} as const

function titleOf(info: ReviewChangeInfo, data: FlowMapData): string {
	if (info.kind === 'rename') {
		const field = info.fields.find(item => item.field === 'label')
		return `${String(field?.before ?? '')} → ${String(field?.after ?? '')}`
	}
	return formatMessage(TITLES[info.kind]() as string, { name: elementName(info, data) })
}

export function suggestionTitle(changes: readonly FlowChange[], data: FlowMapData): string {
	const infos = changes.flatMap(change => flowReviewAdapter.describe(change) ?? [])
	const main = infos.find(info => info.entity === 'node') ?? infos[0]
	if (!main) return UI_FLOW_REVIEW.SUGGESTION_UNTITLED
	const others = new Set(infos.filter(info => info !== main).map(info => `${info.entity}:${info.id}`)).size
	const title = titleOf(main, data)
	return others > 0 ? formatMessage(UI_FLOW_REVIEW.TITLE_MORE, { title, n: others }) : title
}

export function entityOfId(data: FlowMapData, id: string): 'node' | 'edge' | 'group' {
	if (data.nodes.some(node => node.id === id)) return 'node'
	return data.edges.some(edge => edge.id === id) ? 'edge' : 'group'
}

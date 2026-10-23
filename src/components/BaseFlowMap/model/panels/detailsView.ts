import { resolveStatus } from './panelStatus'
import { formatNumber } from '@/locales/state'
import type { DescriptionsItem } from '@components/BaseDescriptions'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowViewport } from '../../types/api/flowController.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowDetailsView, FlowPanelsSource } from '../../types/internal/flowPanels.types'
import type { FlowMapData, FlowMetric, FlowNode, FlowRect, FlowSize, FlowStatus } from '../../types/data/flowData.types'

const SHEET_TARGET = 0.2
const TRENDS = { up: ' ↑', down: ' ↓', flat: ' →' }

function metricText(metric: FlowMetric, data: FlowMapData): string {
	const value = typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value
	const unit = metric.unit ? ` ${metric.unit}` : ''
	const trend = metric.trend ? TRENDS[metric.trend] : ''
	const status = metric.status ? ` (${resolveStatus(metric.status, data).label})` : ''
	return `${value}${unit}${trend}${status}`
}

function mergeMetrics(own: FlowMetric[] | undefined, live: FlowMetric[] | undefined): FlowMetric[] {
	const merged = new Map((own ?? []).map(metric => [metric.id, metric]))
	live?.forEach(metric => merged.set(metric.id, metric))
	return [...merged.values()]
}

function metricItems(metrics: FlowMetric[], data: FlowMapData): DescriptionsItem[] {
	return metrics.map(metric => ({ key: metric.id, label: metric.label, value: metricText(metric, data) }))
}

function statusOf(status: FlowStatus | undefined, data: FlowMapData): FlowDetailsView['status'] {
	return status ? resolveStatus(status, data) : undefined
}

function labelsOf(source: FlowPanelsSource, ids: string[]): string[] {
	return [...new Set(ids.map(id => source.graph.nodes.get(id)?.label ?? id))]
}

function nodeKindText(source: FlowPanelsSource, node: FlowNode): string {
	return [source.nodeKind(node).label(), node.subtitle].filter(Boolean).join(' · ')
}

function nodeDetails(node: FlowNode, source: FlowPanelsSource): FlowDetailsView {
	const live = source.live.nodes?.[node.id]
	const lane = source.graph.ancestry(node.id)[0]
	return {
		entity: 'node',
		id: node.id,
		title: node.label,
		kind: nodeKindText(source, node),
		lane: lane ? { label: lane.label, color: lane.color } : undefined,
		status: statusOf(live?.status ?? node.status, source.data),
		description: node.description,
		metrics: metricItems(mergeMetrics(node.metrics, live?.metrics), source.data),
		fields: node.fields ?? [],
		calls: labelsOf(
			source,
			source.graph.outgoing(node.id).map(edge => edge.target),
		),
		calledBy: labelsOf(
			source,
			source.graph.incoming(node.id).map(edge => edge.source),
		),
		owner: node.owner,
		links: node.links ?? [],
	}
}

function edgeDetails(id: string, source: FlowPanelsSource): FlowDetailsView | null {
	const edge = source.graph.edges.get(id)
	if (!edge) return null
	const live = source.live.edges?.[id]
	const [from, to] = labelsOf(source, [edge.source, edge.target])
	const ends = `${from} → ${to}`
	return {
		entity: 'edge',
		id,
		title: edge.label ?? ends,
		kind: `${source.edgeKind(edge).label()} · ${ends}`,
		status: statusOf(live?.status ?? edge.status, source.data),
		description: edge.description,
		metrics: metricItems(mergeMetrics(edge.metrics, live?.metrics), source.data),
		fields: [],
		calls: [],
		calledBy: [],
		links: [],
	}
}

function groupDetails(id: string, source: FlowPanelsSource): FlowDetailsView | null {
	const group = source.graph.groups.get(id)
	if (!group) return null
	return {
		entity: 'group',
		id,
		title: group.label,
		kind: source.groupKind(group).label(),
		description: group.description,
		metrics: [],
		fields: [],
		calls: [],
		calledBy: [],
		links: [],
	}
}

export function buildDetails(target: FlowElementRef, source: FlowPanelsSource): FlowDetailsView | null {
	if (target.entity === 'node') {
		const node = source.graph.nodes.get(target.id)
		return node ? nodeDetails(node, source) : null
	}
	return target.entity === 'edge' ? edgeDetails(target.id, source) : groupDetails(target.id, source)
}

export function panelsSource(context: FlowMapContext): FlowPanelsSource {
	const { model } = context
	return {
		data: model.data.value,
		notation: model.notation.value,
		graph: model.graph.value,
		live: model.live.value,
		nodeKind: model.nodeKind,
		edgeKind: model.edgeKind,
		groupKind: model.groupKind,
	}
}

export function sheetViewport(rect: FlowRect, viewport: FlowViewport, frame: FlowSize): FlowViewport {
	return {
		zoom: viewport.zoom,
		x: frame.width / 2 - (rect.x + rect.width / 2) * viewport.zoom,
		y: frame.height * SHEET_TARGET - (rect.y + rect.height / 2) * viewport.zoom,
	}
}

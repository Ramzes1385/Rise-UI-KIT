import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowEdge, FlowNode, FlowStatusDef } from '../../types/data/flowData.types'
import type { FlowStatusView } from '../../types/internal/core/flowRenderInternal.types'

const DEFAULT_STATUSES: Record<string, () => FlowStatusView> = {
	ok: () => ({ id: 'ok', label: UI_FLOW_MAP.STATUS_OK, icon: 'check-circle', color: 'var(--rise-success)' }),
	warning: () => ({ id: 'warning', label: UI_FLOW_MAP.STATUS_WARNING, icon: 'alert-triangle', color: 'var(--rise-warning)' }),
	error: () => ({ id: 'error', label: UI_FLOW_MAP.STATUS_ERROR, icon: 'alert-triangle', color: 'var(--rise-error)' }),
	down: () => ({ id: 'down', label: UI_FLOW_MAP.STATUS_DOWN, icon: 'close', color: 'var(--rise-error)' }),
	unknown: () => ({ id: 'unknown', label: UI_FLOW_MAP.STATUS_UNKNOWN, icon: 'info', color: 'var(--rise-text-dimmed)' }),
}

export function statusView(status: string | undefined, defs: readonly FlowStatusDef[] | undefined): FlowStatusView | null {
	if (!status) return null
	const custom = defs?.find(def => def.id === status)
	if (custom) return { id: custom.id, label: custom.label, icon: custom.icon, color: custom.color }
	return DEFAULT_STATUSES[status]?.() ?? { id: status, label: status, icon: 'info', color: 'var(--rise-text-dimmed)' }
}

export function describeNode(node: FlowNode, kindLabel: string, status: FlowStatusView | null): string {
	if (!status) return formatMessage(UI_FLOW_MAP.NODE_ARIA, { label: node.label, kind: kindLabel })
	return formatMessage(UI_FLOW_MAP.NODE_ARIA_STATUS, { label: node.label, kind: kindLabel, status: status.label })
}

export function describeLinks(incoming: number, outgoing: number): string {
	return formatMessage(UI_FLOW_MAP.ARIA_LINKS, { incoming, outgoing })
}

export function describeEdge(edge: FlowEdge, kindLabel: string, names: { source: string; target: string }): string {
	const values = { kind: kindLabel, label: edge.label ?? '', source: names.source, target: names.target }
	return formatMessage(edge.label ? UI_FLOW_MAP.EDGE_ARIA_LABELED : UI_FLOW_MAP.EDGE_ARIA, values)
}

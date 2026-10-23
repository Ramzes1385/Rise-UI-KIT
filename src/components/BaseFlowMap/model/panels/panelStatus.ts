import { UI_FLOW_PANELS } from '@/locales/messages'
import type { FlowMapData, FlowStatus } from '../../types/data/flowData.types'
import type { FlowBuiltInStatus, FlowStatusView } from '../../types/internal/flowPanels.types'

const BUILT_IN: Record<string, FlowBuiltInStatus> = {
	ok: { label: () => UI_FLOW_PANELS.STATUS_OK, icon: 'check-circle', color: 'var(--rise-success)', badge: 'success' },
	warning: { label: () => UI_FLOW_PANELS.STATUS_WARNING, icon: 'alert-triangle', color: 'var(--rise-warning)', badge: 'warning' },
	error: { label: () => UI_FLOW_PANELS.STATUS_ERROR, icon: 'x-circle', color: 'var(--rise-error)', badge: 'error' },
	down: { label: () => UI_FLOW_PANELS.STATUS_DOWN, icon: 'minus', color: 'var(--rise-error)', badge: 'error' },
	unknown: { label: () => UI_FLOW_PANELS.STATUS_UNKNOWN, icon: 'info', color: 'var(--rise-text-muted)', badge: 'neutral' },
}

export function resolveStatus(status: FlowStatus, data: FlowMapData): FlowStatusView {
	const custom = data.statuses?.find(item => item.id === status)
	if (custom) return { id: status, label: custom.label, icon: custom.icon, color: custom.color, badge: 'neutral' }
	const known = BUILT_IN[status] ?? BUILT_IN.unknown!
	return { id: status, label: known.label(), icon: known.icon, color: known.color, badge: known.badge }
}

export const BUILT_IN_STATUS_IDS = Object.keys(BUILT_IN)

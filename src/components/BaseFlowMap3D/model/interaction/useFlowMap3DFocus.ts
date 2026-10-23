import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { statusView } from '@components/BaseFlowMap/model/a11y/flowDescribe'
import type { FlowMap3DFocusApi, FlowMap3DFocusOptions } from '../../types/internal/flowMap3dInternal.types'

export function useFlowMap3DFocus(options: FlowMap3DFocusOptions): FlowMap3DFocusApi {
	const { model, focused } = options

	function move(id: string | null): void {
		focused.value = id
		const node = id ? model.shown.value.nodes.find(item => item.id === id) : undefined
		if (!id || !node) return
		model.events.emit('focus-change', { entity: 'node', id })
		const status = statusView(model.live.value.nodes?.[id]?.status ?? node.status, model.data.value.statuses)
		options.announce(formatMessage(UI_FLOW_MAP_3D.ANNOUNCE_FOCUS, { name: node.label, status: status?.label ?? '' }).trim())
		if (!options.isVisible(id)) options.reveal(id)
	}

	return { move, clear: () => void (focused.value = null) }
}

import { computed } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { describeNode, statusView } from '@components/BaseFlowMap/model/a11y/flowDescribe'
import type { FlowMap3DListGroup, FlowMap3DListOptions } from '../../types/internal/flowMap3dInternal.types'

export function useFlowMap3DList(options: FlowMap3DListOptions) {
	const { model } = options
	const groups = computed((): FlowMap3DListGroup[] => {
		const shown = model.shown.value
		const entries = shown.nodes.map(node => {
			const kind = model.nodeKind(node)
			const status = statusView(model.live.value.nodes?.[node.id]?.status ?? node.status, model.data.value.statuses)
			return { id: node.id, group: node.group, label: describeNode(node, kind.label(), status) }
		})
		const named = (shown.groups ?? []).flatMap(group => {
			const members = entries.filter(entry => entry.group === group.id)
			return members.length > 0 ? [{ id: group.id, label: group.label, entries: members }] : []
		})
		const known = new Set((shown.groups ?? []).map(group => group.id))
		const rest = entries.filter(entry => !entry.group || !known.has(entry.group))
		return rest.length > 0 ? [...named, { id: '', label: UI_FLOW_MAP_3D.LIST_NO_GROUP, entries: rest }] : named
	})

	function choose(id: string): void {
		options.pick.pick({ entity: 'node', id })
		options.focus.move(id)
		options.reveal(id)
	}

	return { groups, choose }
}

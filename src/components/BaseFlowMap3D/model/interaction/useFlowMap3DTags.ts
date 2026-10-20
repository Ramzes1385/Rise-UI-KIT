import { computed } from 'vue'
import { statusView } from '@components/BaseFlowMap/model/a11y/flowDescribe'
import { highlightOf } from '@components/BaseFlowMap/model/context/useFlowHighlight'
import type { FlowMap3DTag, FlowMap3DTagOptions } from '../../types/internal/flowMap3dInternal.types'

export function useFlowMap3DTags(options: FlowMap3DTagOptions) {
	const { model, states } = options
	return computed((): FlowMap3DTag[] => {
		const current = states.value
		return options.snapshot.value.nodes.map(item => {
			const { node } = item
			const live = model.live.value.nodes?.[node.id]
			return {
				id: node.id,
				node,
				kind: item.kind,
				name: node.label,
				statusId: live?.status ?? node.status,
				status: statusView(live?.status ?? node.status, model.data.value.statuses),
				isSelected: current.selection.has(node.id),
				isFocused: current.focus === node.id,
				isActive: current.active.has(node.id),
				isHovered: current.hover === node.id,
				isDim: highlightOf(current.highlight, node.id).isDim,
			}
		})
	})
}

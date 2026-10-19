import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowGroupItem } from '../../types/internal/core/flowRenderInternal.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

function depthOf(graph: FlowGraph, id: string): number {
	let depth = 0
	let parent = graph.groups.get(id)?.parent
	while (parent && depth < 16) {
		depth += 1
		parent = graph.groups.get(parent)?.parent
	}
	return depth
}

export function useFlowGroups(model: FlowModelInternal): ComputedRef<FlowGroupItem[]> {
	return computed(() => {
		const rects = model.layout.value.groups
		const graph = model.graph.value
		return (model.shown.value.groups ?? [])
			.filter(group => rects[group.id])
			.map(group => {
				const kind = model.groupKind(group)
				return {
					id: group.id,
					group,
					rect: rects[group.id],
					kindLabel: kind.label(),
					layout: kind.layout,
					header: kind.header ?? 'top',
					border: kind.border ?? 'solid',
					depth: depthOf(graph, group.id),
					collapseLabel: formatMessage(UI_FLOW_MAP.GROUP_COLLAPSE, { name: group.label }),
				}
			})
			.sort((first, second) => first.depth - second.depth)
	})
}

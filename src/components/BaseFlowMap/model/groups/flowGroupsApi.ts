import type { FlowGroupsApi } from '../../types/internal/flowGroups.types'
import type { FlowControllerParts } from '../../types/internal/core/flowModelCore.types'

const ZOOM_LIMITS = { min: 0.2, max: 3 }

export function createGroupsApi(parts: FlowControllerParts): FlowGroupsApi {
	const { groups } = parts.state
	const { view } = parts
	return {
		toggleGroup: (id, isCollapsed) => groups.toggle(id, isCollapsed),
		getCollapsed: () => [...groups.collapsed.value],
		getLevel: () => groups.level.value,
		setLevel(index, options) {
			if (groups.entries.value.length === 0) return
			groups.setLevel(index, ZOOM_LIMITS)
			view.fitView({ isAnimated: options?.isAnimated ?? true })
		},
		enterGroup(id, options) {
			groups.enter(id)
			view.fitView({ ids: [id], isAnimated: options?.isAnimated ?? true })
		},
		leaveGroup(depth, options) {
			const target = groups.leave(depth)
			view.fitView({ ids: target ? [target] : undefined, isAnimated: options?.isAnimated ?? true })
		},
	}
}

import { shallowRef, watch } from 'vue'
import type { BaseGanttEmits, GanttProps, GanttTaskId } from '../../types/BaseGantt.types'

export function useGanttCollapse(props: GanttProps, emit: BaseGanttEmits) {
	const collapsed = shallowRef<ReadonlySet<GanttTaskId>>(new Set(props.collapsedIds))

	watch(
		() => props.collapsedIds,
		ids => {
			collapsed.value = new Set(ids)
		},
	)

	function toggle(id: GanttTaskId): void {
		const next = new Set(collapsed.value)
		if (!next.delete(id)) next.add(id)
		collapsed.value = next
		emit('update:collapsedIds', [...next])
	}

	return {
		collapsed,
		toggle,
		setCollapsed(id: GanttTaskId, isCollapsed: boolean): void {
			if (collapsed.value.has(id) !== isCollapsed) toggle(id)
		},
	}
}

import { computed, onScopeDispose, ref, shallowRef } from 'vue'
import type { FlowMapContext } from '../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'
import type { FlowEditNotice, FlowEditState } from '../../../types/internal/edit/flowEdit.types'

const NOTICE_MS = 5000

export function useEditState(model: FlowModelInternal, map: FlowMapContext): FlowEditState {
	const isEditing = computed(() => model.mode.value === 'edit')
	const isActive = computed(() => isEditing.value || model.mode.value === 'review')
	const isCompact = computed(() => map.isCompact.value)
	const tool = ref<FlowEditState['tool']['value']>('select')
	const isHandHeld = ref(false)
	const portNodes = computed(() => {
		if (!isActive.value || isCompact.value || (tool.value !== 'select' && tool.value !== 'connect')) return []
		const ids = new Set([...model.selection.value, map.hovered.value ?? '', map.focused.value ?? ''])
		return [...ids].filter(id => model.graph.value.nodes.has(id))
	})
	return {
		isActive,
		isEditing,
		isCompact,
		tool,
		isHandHeld,
		portNodes,
		isGridOn: ref(true),
		isSnapOn: ref(true),
		tab: ref('props'),
		marquee: ref(null),
		ghosts: ref([]),
		guides: ref([]),
		dropGroup: ref(null),
		link: ref(null),
		notices: ref([]),
		label: ref(null),
		isHelpOpen: ref(false),
		linkFrom: ref(null),
		menu: shallowRef(null),
	}
}

export function useNotices(state: FlowEditState): (type: FlowEditNotice['type'], text: string) => void {
	let counter = 0
	const timers = new Set<ReturnType<typeof setTimeout>>()
	onScopeDispose(() => timers.forEach(timer => clearTimeout(timer)))
	return (type, text) => {
		counter += 1
		const id = counter
		state.notices.value = [...state.notices.value.slice(-2), { id, type, text }]
		const timer = setTimeout(() => {
			timers.delete(timer)
			state.notices.value = state.notices.value.filter(item => item.id !== id)
		}, NOTICE_MS)
		timers.add(timer)
	}
}

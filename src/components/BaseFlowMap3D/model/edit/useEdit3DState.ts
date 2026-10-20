import { watch } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { computed, onBeforeUnmount, ref } from 'vue'
import type { FlowMap3DComposeParts, FlowMap3DInput, FlowMap3DStage } from '../../types/internal/flowMap3dCompose.types'
import type { FlowMap3DEditHistory, FlowMap3DEditNotice, FlowMap3DEditTool } from '../../types/internal/flowMap3dEdit.types'

const NOTICE_MS = 4000

function useNotice(announce: (text: string) => void) {
	const notice = ref<FlowMap3DEditNotice | null>(null)
	let timer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(timer))
	function notify(next: FlowMap3DEditNotice): void {
		notice.value = next
		announce(next.text)
		clearTimeout(timer)
		timer = setTimeout(() => (notice.value = null), NOTICE_MS)
	}
	return { notice, notify }
}

function useHistory(parts: FlowMap3DComposeParts) {
	const { model } = parts.core
	const count = ref(0)
	const refresh = (): void => void (count.value = model.history.list().filter(item => !item.isUndone).length)
	const off = model.controller.on('history-change', refresh)
	onBeforeUnmount(off)
	return computed((): FlowMap3DEditHistory => {
		const { canUndo, canRedo, undoLabel } = model.history.state.value
		return { count: count.value, canUndo, canRedo, undoLabel: undoLabel ?? '' }
	})
}

export function useEdit3DState(parts: FlowMap3DComposeParts, _stage: FlowMap3DStage, input: FlowMap3DInput) {
	const { model } = parts.core
	const isActive = computed(() => parts.core.view.isEditIn3D.value)
	const tool = ref<FlowMap3DEditTool>('select')
	const inspectorFocus = ref(0)
	const selected = (): string[] => model.selection.value.filter(id => model.graph.value.nodes.has(id))
	const focusedNode = (): string[] =>
		parts.focused.value && model.graph.value.nodes.has(parts.focused.value) ? [parts.focused.value] : []
	watch(isActive, value => parts.core.announce(value ? UI_FLOW_MAP_3D.EDIT_ON : UI_FLOW_MAP_3D.EDIT_OFF))
	return {
		isActive,
		tool,
		inspectorFocus,
		selected,
		targets: (): string[] => (selected().length > 0 ? selected() : focusedNode()),
		selection: computed(() => selected()),
		history: useHistory(parts),
		openInspector: (): void => void (inspectorFocus.value += 1),
		pickNode: (id: string): void => input.pick.pick({ entity: 'node', id }),
		...useNotice(parts.core.announce),
	}
}

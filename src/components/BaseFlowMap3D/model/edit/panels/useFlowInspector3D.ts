import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import type { FlowMap3DInspectorProps } from '../../../types/internal/flowMap3dEdit.types'

export function useFlowInspector3D(props: FlowMap3DInspectorProps) {
	const rootRef = useTemplateRef<HTMLElement>('rootRef')
	const title = computed(() =>
		props.count > 1
			? formatMessage(UI_FLOW_MAP_3D.EDIT_SELECTED_MANY, { count: props.count })
			: (props.node?.label ?? UI_FLOW_MAP_3D.INSPECTOR),
	)
	const historyText = computed(() => {
		const { count, undoLabel } = props.history
		return undoLabel
			? formatMessage(UI_FLOW_MAP_3D.HISTORY_UNDO, { count, label: undoLabel })
			: formatMessage(UI_FLOW_MAP_3D.HISTORY, { count })
	})
	watch(
		() => props.focusTick,
		() => void nextTick(() => rootRef.value?.querySelector<HTMLElement>('input')?.focus()),
	)
	return { title, historyText }
}

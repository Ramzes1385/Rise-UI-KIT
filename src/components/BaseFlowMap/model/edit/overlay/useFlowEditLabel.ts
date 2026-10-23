import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { cancelLabel, commitLabel } from '../panels/editLabel'
import type { FlowEditLabelDraft } from '../../../types/internal/edit/flowEdit.types'

export function useFlowEditLabel() {
	const context = useEditContext()
	const draft: Ref<FlowEditLabelDraft | null> = context.env.state.label
	const value = ref('')
	let last: unknown = null
	watch(draft, next => (value.value = next?.value ?? ''), { immediate: true })
	return {
		draft,
		value,
		ariaLabel: UI_FLOW_EDITOR.LABEL_INPUT,
		style: computed(() => {
			const box = draft.value?.box
			return box ? { left: `${box.x}px`, top: `${box.y}px`, width: `${Math.max(box.width, 120)}px` } : {}
		}),
		focus: (element: unknown) => {
			if (element === last || !(element instanceof HTMLElement)) return
			last = element
			const field = element.querySelector<HTMLInputElement>('input, textarea')
			field?.focus()
			field?.select()
		},
		save: () => void commitLabel(context, value.value),
		cancel: () => cancelLabel(context),
		onKeydown: (event: KeyboardEvent) => {
			if (event.key === 'Escape') cancelLabel(context)
			else if (event.key === 'Enter' && !(event.shiftKey && draft.value?.isMultiline)) void commitLabel(context, value.value)
			else return
			event.preventDefault()
			event.stopPropagation()
		},
	}
}

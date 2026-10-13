import { onMounted, ref } from 'vue'
import type { KanbanTextEditorEmits, KanbanTextEditorProps } from '../../types/KanbanParts.types'

export function useKanbanTextEditor(props: KanbanTextEditorProps, emit: KanbanTextEditorEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const fieldRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
	const text = ref(props.value)
	let isClosed = false
	onMounted(() => {
		fieldRef.value?.textareaRef?.focus()
		fieldRef.value?.textareaRef?.select()
	})
	const submit = (): void => {
		const value = text.value
		isClosed = !props.isRepeating
		text.value = props.isRepeating ? '' : value
		emit('submit', value)
		if (props.isRepeating) fieldRef.value?.textareaRef?.focus()
	}
	const cancel = (): void => {
		isClosed = true
		emit('cancel')
	}
	return {
		rootRef,
		fieldRef,
		text,
		submit,
		cancel,
		handleInput(value: string): void {
			text.value = value
		},
		handleKeydown(event: KeyboardEvent): void {
			if (event.isComposing) return
			if (event.key === 'Escape') {
				event.stopPropagation()
				cancel()
			} else if (event.key === 'Enter' && event.target === fieldRef.value?.textareaRef) {
				event.preventDefault()
				submit()
			}
		},
		handleFocusOut(event: FocusEvent): void {
			if (isClosed || rootRef.value?.contains(event.relatedTarget as Node | null)) return
			emit('leave', text.value)
		},
	}
}

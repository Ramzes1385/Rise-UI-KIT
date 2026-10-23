/** Composable: поле ввода чата в режиме правки сообщения */
import { watch } from 'vue'
import { focusCaretLater } from './chatInputText'
import type { UseChatEditFieldOptions } from './types/useChatInputState.types'

/**
 * Правка сообщения: поле заполняется его текстом, а набранный до правки черновик возвращается, когда правка закончилась
 * (отправлена или отменена).
 */
function useChatEditField(options: UseChatEditFieldOptions) {
	const { props, emit, text, getInputElement } = options
	let draftBeforeEdit = ''
	watch(
		() => props.editingMessage,
		(message, previous) => {
			if (message) {
				if (!previous) draftBeforeEdit = text.value
				text.value = message.text
				focusCaretLater(getInputElement(), message.text.length)
			} else if (previous) {
				text.value = draftBeforeEdit
				draftBeforeEdit = ''
			}
		},
		{ immediate: true },
	)

	return {
		submit(): boolean {
			const editing = props.editingMessage
			if (!editing) return false
			const trimmed = text.value.trim()
			if (trimmed === editing.text.trim()) emit('cancel-edit')
			else if (trimmed) emit('edit', { text: trimmed })
			return true
		},
		editLastOnArrowUp(event: KeyboardEvent): boolean {
			if (event.key !== 'ArrowUp' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return false
			if (props.editingMessage || text.value !== '') return false
			event.preventDefault()
			emit('edit-last')
			return true
		},
		cancelOnEscape(event: KeyboardEvent): boolean {
			if (event.key !== 'Escape' || !props.editingMessage) return false
			event.preventDefault()
			emit('cancel-edit')
			return true
		},
	}
}

export { useChatEditField }

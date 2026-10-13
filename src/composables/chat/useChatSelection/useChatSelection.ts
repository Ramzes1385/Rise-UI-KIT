/** Composable: выделение сообщений в чате */
import { nextTick, ref } from 'vue'
import type { UseChatSelectionOptions } from './types/useChatSelection.types'

/** Лента и панель выбора: Escape в них отменяет выбор */
const CHAT_SELECTION_SCOPE = '.base-chat-message-list, .base-chat-selection-toolbar'

/** Поле ввода, куда возвращается фокус после отмены выбора */
const CHAT_INPUT_FIELD = '.base-chat-input__field'

/** Composable для выделения сообщений в чате — toggle, сброс, emit событий. */
function useChatSelection(options: UseChatSelectionOptions) {
	const selectedMessageIds = ref<string[]>([])

	function handleMessageSelect(messageId: string): void {
		const index = selectedMessageIds.value.indexOf(messageId)
		if (index === -1) {
			selectedMessageIds.value.push(messageId)
		} else {
			selectedMessageIds.value.splice(index, 1)
		}
		options.onMessageSelect(messageId)
	}

	function selectAll(messageIds: string[]): void {
		for (const messageId of messageIds) {
			if (!selectedMessageIds.value.includes(messageId)) {
				selectedMessageIds.value.push(messageId)
				options.onMessageSelect(messageId)
			}
		}
	}

	function handleSelectionEscape(event: KeyboardEvent): void {
		if (selectedMessageIds.value.length === 0 || event.defaultPrevented) return
		if (!(event.target instanceof Element) || !event.target.closest(CHAT_SELECTION_SCOPE)) return
		event.preventDefault()
		selectedMessageIds.value = []
		const root = event.currentTarget instanceof Element ? event.currentTarget : null
		nextTick(() => root?.querySelector<HTMLElement>(CHAT_INPUT_FIELD)?.focus())
	}

	return {
		selectedMessageIds,
		handleMessageSelect,
		selectAll,
		handleSelectionEscape,
	}
}

export { useChatSelection }

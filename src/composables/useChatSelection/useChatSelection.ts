/** Composable: выделение сообщений в чате */
import { ref } from 'vue'
import type { UseChatSelectionOptions } from './useChatSelection.types'

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

	return {
		selectedMessageIds,
		handleMessageSelect,
	}
}

export { useChatSelection }

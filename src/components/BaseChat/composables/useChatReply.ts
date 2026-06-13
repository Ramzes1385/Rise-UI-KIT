import { ref } from 'vue'
import type { ChatMessage } from '../BaseChat.types'

export function useChatReply() {
	const replyingTo = ref<ChatMessage | null>(null)

	function handleMessageReply(message: ChatMessage): void {
		replyingTo.value = message
	}

	function handleCancelReply(): void {
		replyingTo.value = null
	}

	return {
		replyingTo,
		handleMessageReply,
		handleCancelReply,
	}
}

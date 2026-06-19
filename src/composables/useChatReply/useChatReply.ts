import { ref } from 'vue'
import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

function useChatReply() {
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

export { useChatReply }

/** Composable: ответ на сообщение в чате */
import { ref } from 'vue'
import type { UseChatReplyReturn } from './types/useChatReply.types'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

/** Composable для ответа на сообщение в чате — хранит сообщение-цитату и обработчики. */
function useChatReply(): UseChatReplyReturn {
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

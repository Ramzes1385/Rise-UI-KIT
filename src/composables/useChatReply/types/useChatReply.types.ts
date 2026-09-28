import type { Ref } from 'vue'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatReplyReturn {
	/** Ref на сообщение, на которое отвечают */
	replyingTo: Ref<ChatMessage | null>
	/** Установить сообщение для ответа */
	handleMessageReply: (message: ChatMessage) => void
	/** Сбросить ответ */
	handleCancelReply: () => void
}

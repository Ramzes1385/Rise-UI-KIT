import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'
import type { Ref } from 'vue'

/**
 * Возвращаемое значение composable useChatReply.
 */
export interface UseChatReplyReturn {
	/** Ref на сообщение, на которое отвечают */
	replyingTo: Ref<ChatMessage | null>
	/** Установить сообщение для ответа */
	handleMessageReply: (message: ChatMessage) => void
	/** Сбросить ответ */
	handleCancelReply: () => void
}

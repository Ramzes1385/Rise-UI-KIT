import type { Ref } from 'vue'
import type { BaseChatEmits, ChatMessage } from '@components/BaseChat/types/BaseChat.types'

export interface MessageListExposed {
	scrollToMessage: (messageId: string) => void
}

export interface UseChatActionsOptions {
	emit: BaseChatEmits
	replyingTo: Ref<ChatMessage | null>
	getAvatar: () => string | undefined
	messageListRef: Ref<MessageListExposed | null>
	handleAvatarClick: (senderId: string) => void
	handleCancelReply: () => void
}

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
	editingMessage: Ref<ChatMessage | null>
	handleCancelEdit: () => void
	/** Скачивать файл при клике по вложению (проп `autoDownload`); `false` — только событие `download-file` */
	isAutoDownload: () => boolean
	/** Открыть «Информацию» о чате — по аватару в шапке. Без неё аватар шапки открывает профиль, как аватар сообщения */
	openInfo?: () => void
}

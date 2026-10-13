import type { Ref } from 'vue'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatEditReturn {
	/** Сообщение, которое сейчас правят; `null` — обычный ввод */
	editingMessage: Ref<ChatMessage | null>
	/** Начать правку своего сообщения; чужое сообщение игнорируется */
	handleMessageEdit: (message: ChatMessage) => void
	/** Выйти из правки без отправки */
	handleCancelEdit: () => void
}

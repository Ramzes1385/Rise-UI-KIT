/** Composable: редактирование своего сообщения в чате */
import { ref } from 'vue'
import type { UseChatEditReturn } from './types/useChatEdit.types'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

/** Хранит сообщение, которое автор правит в поле ввода: начать, отменить, завершить. Править можно только свои сообщения с текстом */
function useChatEdit(): UseChatEditReturn {
	const editingMessage = ref<ChatMessage | null>(null)

	return {
		editingMessage,
		handleMessageEdit(message: ChatMessage): void {
			if (message.sender === 'me') editingMessage.value = message
		},
		handleCancelEdit(): void {
			editingMessage.value = null
		},
	}
}

export { useChatEdit }

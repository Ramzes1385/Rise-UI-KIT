/** Composable: логика ChatMessageReactions — реакции сообщения: своя реакция и её переключение */
import type { ChatMessageReaction } from '../../../types/BaseChat.types'
import type { ChatMessageReactionsEmits } from '../types/ChatMessageReactions.types'

export function useChatMessageReactions(emit: ChatMessageReactionsEmits) {
	return {
		/** Реакция текущего пользователя: в списке users он записан как 'me' */
		isOwn: (reaction: ChatMessageReaction): boolean => reaction.users.includes('me'),
		handleClick: (emoji: string): void => emit('toggle', emoji),
	}
}

import type { ChatMessageReaction } from '../../../types/BaseChat.types'
import type { ChatMessageReactionsEmits } from '../types/ChatMessageReactions.types'

export function useChatMessageReactions(emit: ChatMessageReactionsEmits) {
	return {
		isOwn: (reaction: ChatMessageReaction): boolean => reaction.users.includes('me'),
		handleClick: (emoji: string): void => emit('toggle', emoji),
	}
}

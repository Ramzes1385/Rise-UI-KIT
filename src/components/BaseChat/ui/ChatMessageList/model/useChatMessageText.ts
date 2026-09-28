import { computed } from 'vue'
import { useMessageParser } from '@composables/useMessageParser'
import type { ChatMessageTextEmits, ChatMessageTextProps, HighlightedToken } from '../types/ChatMessageText.types'

export function useChatMessageText(props: ChatMessageTextProps, emit: ChatMessageTextEmits) {
	const { getHighlightedParts, parseMessageText } = useMessageParser({ searchQuery: () => props.searchQuery ?? '' })
	return {
		highlightedTokens: computed<HighlightedToken[]>(() =>
			parseMessageText(props.text).map(token => ({
				...token,
				highlightedParts: token.type === 'text' ? getHighlightedParts(token.value) : [],
			})),
		),
		handleMentionClick: (mention: string): void => emit('mention-click', mention.slice(1)),
		handleCommandClick: (command: string): void => emit('command-click', command.slice(1)),
	}
}

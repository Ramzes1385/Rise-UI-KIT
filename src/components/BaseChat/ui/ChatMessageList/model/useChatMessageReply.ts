/** Composable: логика ChatMessageReply — цитата, клик по которой прокручивает ленту к исходному сообщению */
import type { ChatMessageReplyEmits, ChatMessageReplyProps } from '../types/ChatMessageReply.types'

export function useChatMessageReply(props: ChatMessageReplyProps, emit: ChatMessageReplyEmits) {
	return {
		handleClick(): void {
			/* istanbul ignore next — defensive: клик возможен только при наличии replyToId (v-if) */
			if (!props.replyToId) return
			emit('click', props.replyToId)
		},
	}
}

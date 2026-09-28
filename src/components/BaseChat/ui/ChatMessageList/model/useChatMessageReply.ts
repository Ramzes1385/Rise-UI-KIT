import type { ChatMessageReplyEmits, ChatMessageReplyProps } from '../types/ChatMessageReply.types'

export function useChatMessageReply(props: ChatMessageReplyProps, emit: ChatMessageReplyEmits) {
	return {
		handleClick(): void {
			if (!props.replyToId) return
			emit('click', props.replyToId)
		},
	}
}

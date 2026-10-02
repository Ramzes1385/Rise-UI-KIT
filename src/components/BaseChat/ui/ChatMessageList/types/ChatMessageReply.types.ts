export interface ChatMessageReplyProps {
	replyToId?: string
	replyToSenderName?: string
	replyToText?: string
}

export interface ChatMessageReplyEmits {
	(event: 'click', replyToId: string): void
}

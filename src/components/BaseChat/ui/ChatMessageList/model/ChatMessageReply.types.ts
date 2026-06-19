export interface ChatMessageReplyProps {
	replyToId?: string
	replyToSenderName?: string
	replyToText?: string
	sizeScale: number
}

export interface ChatMessageReplyEmits {
	(event: 'click', replyToId: string): void
}

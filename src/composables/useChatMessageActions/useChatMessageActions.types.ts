import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'

export interface UseChatMessageActionsOptions {
	selectedMessageIds: { value: readonly string[] }
	emit: {
		(event: 'avatar-click', senderId: string): void
		(event: 'message-select', messageId: string): void
		(event: 'reply-click', replyToId: string): void
		(event: 'message-reply', message: ChatMessage): void
		(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
		(event: 'download-file', file: ChatMessageAttachment): void
		(event: 'file-click', file: ChatMessageAttachment): void
		(event: 'pin-message', messageId: string): void
		(event: 'delete-message', messageId: string): void
		(event: 'mention-click', mention: string): void
		(event: 'command-click', command: string): void
	}
}

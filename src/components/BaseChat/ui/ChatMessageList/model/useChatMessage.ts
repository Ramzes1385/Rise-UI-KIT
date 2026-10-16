import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMessage, ChatMessageAttachment, ChatMessageStatus } from '../../../types/BaseChat.types'
import type { ChatContextMenuEvent, ChatMessageItemEmits, MessageItemProps } from '../types/ChatMessageItem.types'

function getMessageImageUrls(message: ChatMessage): string[] {
	return message.attachments?.filter(attachment => attachment.type === 'image').map(attachment => attachment.url) ?? []
}

function useSender(props: MessageItemProps) {
	const statusLabels: Record<Exclude<ChatMessageStatus, 'sending'>, string> = {
		failed: UI_CHAT_TEXT.STATUS_FAILED,
		sent: UI_CHAT_TEXT.STATUS_SENT,
		delivered: UI_CHAT_TEXT.STATUS_DELIVERED,
		read: UI_CHAT_TEXT.STATUS_READ,
	}
	return {
		hasAvatar: computed(() => props.message.sender === 'other' && Boolean(props.message.senderAvatar)),
		showSenderName: computed(() => props.isGroup && props.message.sender === 'other' && Boolean(props.message.senderName)),
		senderName: computed(() => props.message.senderName || 'Companion'),
		avatarLabel: computed(() =>
			props.message.senderName
				? formatMessage(UI_CHAT_TEXT.PROFILE_OF, { name: props.message.senderName })
				: UI_CHAT_TEXT.SENDER_PROFILE_ARIA,
		),
		statusLabel: computed(() =>
			props.message.status && props.message.status !== 'sending' ? statusLabels[props.message.status] : undefined,
		),
		isFailed: computed(() => props.message.sender === 'me' && props.message.status === 'failed'),
		gallery: computed(() => (props.allImagesUrls.length > 0 ? props.allImagesUrls : getMessageImageUrls(props.message))),
	}
}

function createRelays(emit: ChatMessageItemEmits) {
	return {
		handleSelect: (): void => emit('select'),
		handleAvatarClick: (): void => emit('avatar-click'),
		handleReplyAction: (): void => emit('reply-action'),
		handleContextMenu: (payload: ChatContextMenuEvent): void => emit('context-menu', payload),
		handleRetry: (payload: MouseEvent): void => emit('retry', payload),
		handleDiscard: (payload: MouseEvent): void => emit('discard', payload),
		handleMoreClick(event: MouseEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			emit(
				'context-menu',
				Object.assign(new MouseEvent('contextmenu', { clientX: rect.left, clientY: rect.bottom + 4 }), { anchorTop: rect.top - 4 }),
			)
		},
		handleReplyClick(replyToId?: string): void {
			if (replyToId) emit('reply-click', replyToId)
		},
		handleDownload: (file: ChatMessageAttachment): void => emit('download', file),
		handleFileClick: (file: ChatMessageAttachment): void => emit('file-click', file),
		handleMentionClick: (mention: string): void => emit('mention-click', mention),
		handleCommandClick: (command: string): void => emit('command-click', command),
		handleReactionToggle: (emoji: string): void => emit('reaction-toggle', emoji),
	}
}

export function useChatMessage(props: MessageItemProps, emit: ChatMessageItemEmits) {
	const sender = useSender(props)
	const relays = createRelays(emit)
	return {
		...sender,
		...relays,
		handleContextMenu(payload: ChatContextMenuEvent): void {
			if (!sender.isFailed.value) relays.handleContextMenu(payload)
		},
	}
}

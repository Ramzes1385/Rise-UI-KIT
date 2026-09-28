/** Composable: логика ChatMessage — сообщение: отправитель, статус доставки, галерея вложений и события действий */
import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMessageItemEmits, MessageItemProps } from '../types/ChatMessageItem.types'
import type { ChatMessage, ChatMessageAttachment, ChatMessageStatus } from '../../../types/BaseChat.types'

function getMessageImageUrls(message: ChatMessage): string[] {
	return message.attachments?.filter(attachment => attachment.type === 'image').map(attachment => attachment.url) ?? []
}

function useSender(props: MessageItemProps) {
	// Доступные названия статусов доставки: галочки передают статус не только цветом
	const statusLabels: Record<Exclude<ChatMessageStatus, 'sending'>, string> = {
		sent: UI_CHAT_TEXT.STATUS_SENT,
		delivered: UI_CHAT_TEXT.STATUS_DELIVERED,
		read: UI_CHAT_TEXT.STATUS_READ,
	}
	return {
		hasAvatar: computed(() => props.message.sender === 'other' && Boolean(props.message.senderAvatar)),
		showSenderName: computed(() => props.isGroup && props.message.sender === 'other' && Boolean(props.message.senderName)),
		senderName: computed(() => props.message.senderName || 'Companion'),
		avatarLabel: computed(() =>
			props.message.senderName ? `${UI_CHAT_TEXT.PROFILE_ARIA} ${props.message.senderName}` : UI_CHAT_TEXT.SENDER_PROFILE_ARIA,
		),
		statusLabel: computed(() =>
			props.message.status && props.message.status !== 'sending' ? statusLabels[props.message.status] : undefined,
		),
		gallery: computed(() => (props.allImagesUrls.length > 0 ? props.allImagesUrls : getMessageImageUrls(props.message))),
	}
}

function createRelays(emit: ChatMessageItemEmits) {
	return {
		handleSelect: (): void => emit('select'),
		handleAvatarClick: (): void => emit('avatar-click'),
		handleReplyAction: (): void => emit('reply-action'),
		handleContextMenu: (payload: MouseEvent): void => emit('context-menu', payload),
		/**
		 * Кнопка «Другие действия» открывает то же меню, что и правый клик. При нажатии с клавиатуры у события нет координат
		 * указателя, поэтому меню ставится под кнопкой
		 */
		handleMoreClick(event: MouseEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			emit('context-menu', new MouseEvent('contextmenu', { clientX: rect.left, clientY: rect.bottom + 4 }))
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
	return { ...useSender(props), ...createRelays(emit) }
}

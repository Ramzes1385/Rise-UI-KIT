/** Composable: действия над сообщениями чата */
import { ref } from 'vue'
import { useScrollToMessage } from './useScrollToMessage'
import { useChatContextMenu, useChatContextMenuItems } from './useChatContextMenu'
import type { UseChatMessageActionsOptions } from './types/useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

/** События самого сообщения: аватар, выбор, цитата, ответ, файлы, реакции, упоминания и команды */
function useChatMessageEvents(emit: UseChatMessageActionsOptions['emit']) {
	return {
		handleAvatarClick(message: ChatMessage): void {
			/* istanbul ignore else — defensive */
			if (message.sender === 'other') {
				/* istanbul ignore next — defensive */
				emit('avatar-click', message.senderId || message.senderName || '')
			}
		},
		handleSelect: (messageId: string): void => emit('message-select', messageId),
		handleReplyClick(replyToId?: string): void {
			/* istanbul ignore else — defensive */
			if (replyToId) emit('reply-click', replyToId)
		},
		handleRetry: (messageId: string): void => emit('retry-message', messageId),
		handleDiscard: (messageId: string): void => emit('discard-message', messageId),
		handleReplyAction: (message: ChatMessage): void => emit('message-reply', message),
		handleDownload: (file: ChatMessageAttachment): void => emit('download-file', file),
		handleFileClick: (file: ChatMessageAttachment): void => emit('file-click', file),
		handleToggleReaction: (messageId: string, emoji: string): void => emit('message-reaction', { messageId, emoji }),
		handleMentionClick: (mention: string): void => emit('mention-click', mention),
		handleCommandClick: (command: string): void => emit('command-click', command),
	}
}

/** Описание: управляет действиями над сообщениями чата — контекстное меню, реакции, ответ, копирование, пин, удаление и скролл к сообщению */
function useChatMessageActions(options: UseChatMessageActionsOptions) {
	const { selectedMessageIds, emit } = options
	const listRef = ref<HTMLElement | null>(null)
	const menu = useChatContextMenu({ listRef, selectedMessageIds })

	return {
		listRef,
		...menu,
		...useChatContextMenuItems(menu, emit),
		...useChatMessageEvents(emit),
		scrollToMessage: useScrollToMessage(listRef),
	}
}

export { useChatMessageActions }

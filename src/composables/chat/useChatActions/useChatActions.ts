import { warn } from '@/locales/warn'
import { getCurrentInstance } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import { downloadFile } from '@utils/media/fileUtils'
import type { UseChatActionsOptions } from './types/useChatActions.types'
/** Composable: обработчики действий чата */
import { getRejectionMessages } from '@composables/chat/useChatInputState/attachments/chatAttachmentLimits'
import type { ChatAttachmentRejection, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

/** Скачивает вложение (если `isAutoDownload`) и сообщает о нём событием `download-file`; ошибку — событием `error` */
function downloadAttachment(emit: UseChatActionsOptions['emit'], file: ChatMessageAttachment, isAutoDownload: boolean): void {
	try {
		if (isAutoDownload) downloadFile(file.url, file.name)
		emit('download-file', file)
	} catch (e) {
		/* istanbul ignore next — defensive: создание DOM-элемента не бросает в стандартной среде */
		emit('error', { type: 'download', message: `[BaseChat] Download failed: ${file.name}`, detail: e })
	}
}

/**
 * «Написать сообщение» в профиле участника: событие `write-message`. Пока приложения не перешли на него, то же действие
 * приходит и как `avatar-click`; предупреждение об устаревании — только тем, кто слушает `avatar-click`
 */
function useWriteMessage(emit: UseChatActionsOptions['emit']): (memberId: string) => void {
	const instance = getCurrentInstance()
	return memberId => {
		emit('write-message', memberId)
		if (instance?.vnode.props?.onAvatarClick) warn(UI_WARNINGS.CHAT_WRITE_MESSAGE_AVATAR_CLICK)
		emit('avatar-click', memberId)
	}
}

/** Описание: предоставляет обработчики действий чата — отправка, ответ, вложение, реакции, пин/удаление, аватар и команды */
function useChatActions(options: UseChatActionsOptions) {
	const { emit, replyingTo, getAvatar, messageListRef, handleAvatarClick, handleCancelReply, openInfo } = options
	const { editingMessage, handleCancelEdit, isAutoDownload } = options

	/** Аватар в шапке — это чат или собеседник целиком: открывает «Информацию», а не профиль участника */
	function handleHeaderAvatarClick(): void {
		if (openInfo) {
			openInfo()
			return
		}
		/* istanbul ignore next — defensive: ChatHeader рендерит аватар (и эмитит avatar-click) только при truthy avatar */
		handleAvatarClick(getAvatar() || '')
	}

	function handleReplyClick(replyToId: string): void {
		messageListRef.value?.scrollToMessage(replyToId)
	}

	function handleSend(payload: { text: string; attachments?: ChatMessageAttachment[] }): void {
		emit('send', {
			...payload,
			replyToId: replyingTo.value?.id || undefined,
		})
		handleCancelReply()
	}

	function handleEdit(payload: { text: string }): void {
		const message = editingMessage.value
		if (message) emit('edit', { messageId: message.id, text: payload.text })
		handleCancelEdit()
	}

	return {
		handleEdit,
		handleHeaderAvatarClick,
		handleReplyClick,
		handleSend,
		handleAttach: (files: FileList) => emit('attach', files),
		handleAttachError: (rejections: ChatAttachmentRejection[]) =>
			emit('error', {
				type: 'attachment',
				message: getRejectionMessages(rejections).join('. '),
				detail: rejections,
			}),
		handleMessageReaction: (payload: { messageId: string; emoji: string }) => emit('message-reaction', payload),
		handleQuickReply: (text: string) => emit('quick-reply', text),
		handleDownloadFile: (file: ChatMessageAttachment) => downloadAttachment(emit, file, isAutoDownload()),
		handlePin: (messageId: string) => emit('pin-message', messageId),
		handleUnpin: (messageId: string) => emit('unpin-message', messageId),
		handleWriteMessage: useWriteMessage(emit),
		handleAddMember: () => emit('add-member'),
		handleUpdateMemberRole: (payload: { memberId: string; role: string }) => emit('update-member-role', payload),
		handleMentionClick: (mention: string) => emit('mention-click', mention),
		handleCommandClick: (command: string) => emit('command-click', command),
	}
}

export { useChatActions }

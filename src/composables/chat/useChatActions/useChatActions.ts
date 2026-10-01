/** Composable: обработчики действий чата */
import { downloadFile } from '@utils/media/fileUtils'
import type { UseChatActionsOptions } from './types/useChatActions.types'
import type { ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

/** Скачивает вложение и сообщает о нём событием `download-file`; ошибку — событием `error` */
function downloadAttachment(emit: UseChatActionsOptions['emit'], file: ChatMessageAttachment): void {
	try {
		downloadFile(file.url, file.name)
		emit('download-file', file)
	} catch (e) {
		/* istanbul ignore next — defensive: создание DOM-элемента не бросает в стандартной среде */
		emit('error', { type: 'download', message: `[BaseChat] Download failed: ${file.name}`, detail: e })
	}
}

/** Описание: предоставляет обработчики действий чата — отправка, ответ, вложение, реакции, пин/удаление, аватар и команды */
function useChatActions(options: UseChatActionsOptions) {
	const { emit, replyingTo, getAvatar, messageListRef, handleAvatarClick, handleCancelReply, openInfo } = options

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

	return {
		handleHeaderAvatarClick,
		handleReplyClick,
		handleSend,
		handleAttach: (files: FileList) => emit('attach', files),
		handleMessageReaction: (payload: { messageId: string; emoji: string }) => emit('message-reaction', payload),
		handleQuickReply: (text: string) => emit('quick-reply', text),
		handleDownloadFile: (file: ChatMessageAttachment) => downloadAttachment(emit, file),
		handlePin: (messageId: string) => emit('pin-message', messageId),
		handleUnpin: (messageId: string) => emit('unpin-message', messageId),
		handleWriteMessage: (memberId: string) => emit('avatar-click', memberId),
		handleKickMember: (memberId: string) => emit('kick-member', memberId),
		handleBanMember: (payload: { memberId: string; reason?: string; warningsCount?: number }) => emit('ban-member', payload),
		handleUpdateMemberRole: (payload: { memberId: string; role: string }) => emit('update-member-role', payload),
		handleMentionClick: (mention: string) => emit('mention-click', mention),
		handleCommandClick: (command: string) => emit('command-click', command),
	}
}

export { useChatActions }

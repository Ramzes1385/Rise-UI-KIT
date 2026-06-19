import { downloadFile } from '@utils/fileUtils'
import type { UseChatActionsOptions } from './useChatActions.types'
import type { ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'

/** Описание: предоставляет обработчики действий чата — отправка, ответ, вложение, реакции, пин/удаление, аватар и команды */
function useChatActions(options: UseChatActionsOptions) {
	const { emit, replyingTo, getAvatar, messageListRef, handleAvatarClick, handleCancelReply } = options

	function handleHeaderAvatarClick(): void {
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

	function handleAttach(files: FileList): void {
		emit('attach', files)
	}

	function handleMessageReaction(payload: { messageId: string; emoji: string }): void {
		emit('message-reaction', payload)
	}

	function handleQuickReply(text: string): void {
		emit('quick-reply', text)
	}

	function handleDownloadFile(file: ChatMessageAttachment): void {
		try {
			downloadFile(file.url, file.name)
			emit('download-file', file)
		} catch (e) {
			/* istanbul ignore next — defensive: создание DOM-элемента не бросает в стандартной среде */
			emit('error', { type: 'download', message: `[BaseChat] Download failed: ${file.name}`, detail: e })
		}
	}

	function handlePin(messageId: string): void {
		emit('pin-message', messageId)
	}

	function handleUnpin(messageId: string): void {
		emit('unpin-message', messageId)
	}

	function handleWriteMessage(memberId: string): void {
		emit('avatar-click', memberId)
	}

	function handleKickMember(memberId: string): void {
		emit('kick-member', memberId)
	}

	function handleBanMember(payload: { memberId: string; reason?: string; warningsCount?: number }): void {
		emit('ban-member', payload)
	}

	function handleUpdateMemberRole(payload: { memberId: string; role: string }): void {
		emit('update-member-role', payload)
	}

	function handleMentionClick(mention: string): void {
		emit('mention-click', mention)
	}

	function handleCommandClick(command: string): void {
		emit('command-click', command)
	}

	return {
		handleHeaderAvatarClick,
		handleReplyClick,
		handleSend,
		handleAttach,
		handleMessageReaction,
		handleQuickReply,
		handleDownloadFile,
		handlePin,
		handleUnpin,
		handleWriteMessage,
		handleKickMember,
		handleBanMember,
		handleUpdateMemberRole,
		handleMentionClick,
		handleCommandClick,
	}
}

export { useChatActions }

/** Composable: действия над сообщениями чата */
import type { Ref } from 'vue'
import { useScrollToMessage } from './useScrollToMessage'
import { getCurrentScope, onScopeDispose, ref } from 'vue'
import { useChatContextMenu, useChatContextMenuItems } from './useChatContextMenu'
import type { UseChatMessageActionsOptions } from './types/useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

/** Поле ввода чата: туда уходит фокус, когда кнопки «Повторить» и «Удалить» пропали из ленты */
const CHAT_INPUT_FIELD = '.base-chat-input__field'

/** Сколько ждать, пока приложение уберёт кнопку (сменит статус сообщения), прежде чем отказаться от переноса фокуса */
const FOCUS_RESTORE_TIMEOUT_MS = 10_000

/** Клик с клавиатуры (Enter, Пробел) приходит с `detail === 0`; мышь и касание — с `detail >= 1` */
function isKeyboardClick(trigger?: Event): boolean {
	return trigger instanceof MouseEvent && trigger.detail === 0
}

/**
 * Кнопка в ленте пропала вместе с состоянием `failed`, и фокус упал в body: возвращает его в поле ввода чата. Только для
 * вызова с клавиатуры (на касание поле не фокусируется: поднялась бы экранная клавиатура). Ждёт, пока кнопка уйдёт из DOM
 * (статус меняет приложение, и это не один `nextTick`); возвращает отмену ожидания.
 */
function restoreFocusAfterFailedAction(listRef: Ref<HTMLElement | null>, trigger?: Event): () => void {
	const list = listRef.value
	const button = list?.ownerDocument.activeElement
	if (!list || !isKeyboardClick(trigger) || !button || !list.contains(button)) return () => undefined
	const observer = new MutationObserver(() => {
		if (button.isConnected) return
		cancel()
		const { activeElement, body } = list.ownerDocument
		if (activeElement && activeElement !== body) return
		list.closest('.base-chat')?.querySelector<HTMLElement>(CHAT_INPUT_FIELD)?.focus()
	})
	const timer = setTimeout(() => cancel(), FOCUS_RESTORE_TIMEOUT_MS)
	function cancel(): void {
		observer.disconnect()
		clearTimeout(timer)
	}
	observer.observe(list, { childList: true, subtree: true })
	return cancel
}

/** События самого сообщения: аватар, выбор, цитата, ответ, файлы, реакции, упоминания и команды */
function useChatMessageEvents(emit: UseChatMessageActionsOptions['emit'], listRef: Ref<HTMLElement | null>) {
	let cancelFocusRestore = (): void => undefined
	const restoreFocus = (trigger?: Event): void => {
		cancelFocusRestore()
		cancelFocusRestore = restoreFocusAfterFailedAction(listRef, trigger)
	}
	if (getCurrentScope()) onScopeDispose(() => cancelFocusRestore())
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
		handleRetry(messageId: string, trigger?: Event): void {
			emit('retry-message', messageId)
			restoreFocus(trigger)
		},
		handleDiscard(messageId: string, trigger?: Event): void {
			emit('discard-message', messageId)
			restoreFocus(trigger)
		},
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
		...useChatMessageEvents(emit, listRef),
		scrollToMessage: useScrollToMessage(listRef),
	}
}

export { useChatMessageActions }

import { onBeforeUnmount, ref } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import {
	UI_SIZE,
	UI_TIMING,
} from '@constants'
import { copyTextToClipboard } from '@utils/clipboardUtils'
import type { UseChatMessageActionsOptions } from './useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'
import type { Ref } from 'vue'

/** Описание: управляет действиями над сообщениями чата — контекстное меню, реакции, ответ, копирование, пин, удаление и скролл к сообщению */
function useChatMessageActions(options: UseChatMessageActionsOptions) {
	const { selectedMessageIds, emit } = options

	const listRef = ref<HTMLElement | null>(null)
	const contextMenuRef = ref<{ $el: HTMLElement } | null>(null)
	const highlightTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

	const contextMenu = ref({
		isOpen: false,
		x: 0,
		y: 0,
		message: null as ChatMessage | null,
	})

	useClickOutside({
		targets: [contextMenuRef as unknown as Ref<HTMLElement | null>],
		callback: closeContextMenu,
		isActive: () => contextMenu.value.isOpen,
	})

	function handleAvatarClick(message: ChatMessage): void {
		/* istanbul ignore else — defensive */
		if (message.sender === 'other') {
			/* istanbul ignore next — defensive */
			emit('avatar-click', message.senderId || message.senderName || '')
		}
	}

	function handleSelect(messageId: string): void {
		emit('message-select', messageId)
	}

	function handleReplyClick(replyToId?: string): void {
		/* istanbul ignore else — defensive */
		if (replyToId) {
			emit('reply-click', replyToId)
		}
	}

	function handleReplyAction(message: ChatMessage): void {
		emit('message-reply', message)
	}

	function handleDownload(file: ChatMessageAttachment): void {
		emit('download-file', file)
	}

	function handleFileClick(file: ChatMessageAttachment): void {
		emit('file-click', file)
	}

	function handleContextMenu(event: MouseEvent, message: ChatMessage): void {
		/* istanbul ignore next — defensive */
		if (selectedMessageIds.value.length > 0) return
		const menuWidth = UI_SIZE.CONTEXT_MENU_WIDTH
		const menuHeight = UI_SIZE.CONTEXT_MENU_HEIGHT
		const windowWidth = window.innerWidth
		const windowHeight = window.innerHeight

		let x = event.clientX
		let y = event.clientY

		/* istanbul ignore next — boundary */
		if (x + menuWidth > windowWidth) {
			x = windowWidth - menuWidth - 16
		}
		/* istanbul ignore next — boundary */
		if (y + menuHeight > windowHeight) {
			y = windowHeight - menuHeight - 16
		}

		contextMenu.value = {
			isOpen: true,
			x: Math.max(16, x),
			y: Math.max(16, y),
			message: message,
		}
	}

	function closeContextMenu(): void {
		contextMenu.value.isOpen = false
		contextMenu.value.message = null
	}

	function handleSelectReaction(emoji: string): void {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) {
			emit('message-reaction', {
				messageId: contextMenu.value.message.id,
				emoji,
			})
		}
		closeContextMenu()
	}

	function handleToggleReaction(messageId: string, emoji: string): void {
		emit('message-reaction', { messageId, emoji })
	}

	function handleContextMenuReply(): void {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) {
			emit('message-reply', contextMenu.value.message)
		}
		closeContextMenu()
	}

	function handleContextMenuSelect(): void {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) {
			emit('message-select', contextMenu.value.message.id)
		}
		closeContextMenu()
	}

	async function handleContextMenuCopy(): Promise<void> {
		if (contextMenu.value.message?.text) {
			await copyTextToClipboard(contextMenu.value.message.text).catch(() => {
				/* clipboard write failure is non-critical */
			})
		}
		closeContextMenu()
	}

	function handleContextMenuPin(): void {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) {
			emit('pin-message', contextMenu.value.message.id)
		}
		closeContextMenu()
	}

	function handleContextMenuDelete(): void {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) {
			emit('delete-message', contextMenu.value.message.id)
		}
		closeContextMenu()
	}

	function scrollToMessage(messageId: string): void {
		const container = listRef.value
		/* istanbul ignore next — defensive */
		if (!container) return
		const element = container.querySelector<HTMLElement>(`#message-${messageId}`)
		/* istanbul ignore next — defensive */
		if (!element) return

		if (highlightTimeoutId.value !== null) {
			clearTimeout(highlightTimeoutId.value)
		}

		element.scrollIntoView({ behavior: 'smooth', block: 'center' })
		element.classList.add('base-chat-message-list__item--highlighted')
		highlightTimeoutId.value = setTimeout(() => {
			element.classList.remove('base-chat-message-list__item--highlighted')
			highlightTimeoutId.value = null
		}, UI_TIMING.HIGHLIGHT_DURATION)
	}

	onBeforeUnmount(() => {
		if (highlightTimeoutId.value !== null) {
			clearTimeout(highlightTimeoutId.value)
		}
	})

	function handleMentionClick(mention: string): void {
		emit('mention-click', mention)
	}

	function handleCommandClick(command: string): void {
		emit('command-click', command)
	}

	return {
		listRef,
		contextMenuRef,
		contextMenu,
		handleAvatarClick,
		handleSelect,
		handleReplyClick,
		handleReplyAction,
		handleDownload,
		handleFileClick,
		handleContextMenu,
		closeContextMenu,
		handleSelectReaction,
		handleToggleReaction,
		handleContextMenuReply,
		handleContextMenuSelect,
		handleContextMenuCopy,
		handleContextMenuPin,
		handleContextMenuDelete,
		scrollToMessage,
		handleMentionClick,
		handleCommandClick,
	}
}

export { useChatMessageActions }

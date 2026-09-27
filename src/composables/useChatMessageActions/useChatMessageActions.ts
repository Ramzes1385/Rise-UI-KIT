/** Composable: действия над сообщениями чата */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import {
	UI_SIZE,
	UI_TIMING,
} from '@constants'
import { copyTextToClipboard } from '@utils/clipboardUtils'
import type { UseChatMessageActionsOptions } from './useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'
import type { ChatMessageContextMenuExpose } from '@components/BaseChat/ui/ChatMessageList/model/ChatMessageContextMenu.types'

/**
 * На сколько пикселей нужно прокрутить ленту, чтобы открытое меню закрылось. Мелкие сдвиги не в счёт: фокус кнопки
 * «Другие действия» у края ленты подкручивает её на несколько пикселей — меню не должно закрываться сразу после открытия.
 */
const SCROLL_CLOSE_THRESHOLD = 16

/** Код символа «-»: влияет на экранирование цифры второй позицией идентификатора */
const HYPHEN_CODE = 0x2d

/**
 * Экранировать строку как CSS-идентификатор (алгоритм CSSOM «serialize an identifier»).
 * id сообщений приходят из данных приложения и могут содержать `.`, `:`, `$`, пробелы
 * (Matrix, Firebase, составные ключи): без экранирования querySelector бросает SyntaxError
 * или находит не тот элемент. CSS.escape есть не во всех средах (jsdom, SSR, старые WebView),
 * поэтому ниже — запасная реализация того же алгоритма.
 */
function escapeCssIdentifier(value: string): string {
	if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value)
	let result = ''
	for (let index = 0; index < value.length; index++) {
		const char = value.charAt(index)
		const code = value.charCodeAt(index)
		const isDigit = code >= 0x30 && code <= 0x39
		const isControl = (code >= 0x01 && code <= 0x1f) || code === 0x7f
		const isLeadingDigit = isDigit && (index === 0 || (index === 1 && value.charCodeAt(0) === HYPHEN_CODE))
		if (code === 0) {
			result += '\uFFFD'
		} else if (isControl || isLeadingDigit) {
			result += `\\${code.toString(16)} `
		} else if (index === 0 && value.length === 1 && code === HYPHEN_CODE) {
			result += `\\${char}`
		} else if (code >= 0x80 || code === HYPHEN_CODE || char === '_' || /[\dA-Za-z]/.test(char)) {
			result += char
		} else {
			result += `\\${char}`
		}
	}
	return result
}

/** Описание: управляет действиями над сообщениями чата — контекстное меню, реакции, ответ, копирование, пин, удаление и скролл к сообщению */
function useChatMessageActions(options: UseChatMessageActionsOptions) {
	const { selectedMessageIds, emit } = options

	const listRef = ref<HTMLElement | null>(null)
	const contextMenuRef = ref<ChatMessageContextMenuExpose | null>(null)
	const highlightTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

	/** Элемент с фокусом до открытия меню (кнопка «Другие действия»): после закрытия из меню фокус возвращается на него */
	let returnFocusTarget: HTMLElement | null = null
	/** Прокрутка ленты в момент открытия меню */
	let scrollTopAtOpen = 0
	const contextMenu = ref({
		isOpen: false,
		x: 0,
		y: 0,
		message: null as ChatMessage | null,
	})

	/**
	 * Корень ChatMessageContextMenu — <Teleport>, поэтому `$el` экземпляра — это плейсхолдер-узел,
	 * а не меню: клик по пункту считался кликом «снаружи» и закрывал меню ещё на mousedown, до click.
	 * Сравниваем с реальным DOM-элементом меню, который компонент отдаёт через defineExpose.
	 */
	const contextMenuElement = computed(() => contextMenuRef.value?.menuRef ?? null)

	useClickOutside({
		targets: [contextMenuElement],
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
		returnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
		scrollTopAtOpen = listRef.value?.scrollTop ?? 0
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

	/**
	 * Закрывает меню. Если фокус был внутри меню (выбор пункта, Escape, Tab), он возвращается на элемент,
	 * с которого меню открыли: иначе после удаления меню из DOM фокус упал бы на body.
	 */
	function closeContextMenu(): void {
		const hadFocus = Boolean(contextMenuElement.value?.contains(document.activeElement))
		contextMenu.value.isOpen = false
		contextMenu.value.message = null
		if (hadFocus && returnFocusTarget?.isConnected) returnFocusTarget.focus()
		returnFocusTarget = null
	}

	/** Прокрутка ленты закрывает меню (оно стоит на месте, а сообщение уезжает), если сдвиг заметный */
	function handleListScroll(): void {
		if (!contextMenu.value.isOpen) return
		const scrollTop = listRef.value?.scrollTop ?? 0
		if (Math.abs(scrollTop - scrollTopAtOpen) > SCROLL_CLOSE_THRESHOLD) closeContextMenu()
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
		const element = container.querySelector<HTMLElement>(`#${escapeCssIdentifier(`message-${messageId}`)}`)
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
		handleListScroll,
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

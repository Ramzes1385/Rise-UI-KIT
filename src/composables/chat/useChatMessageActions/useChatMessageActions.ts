/** Composable: действия над сообщениями чата */
import { computed, onBeforeUnmount, ref } from 'vue'
import { copyTextToClipboard } from '@utils/dom/clipboardUtils'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { UseChatMessageActionsOptions } from './types/useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'
import type { ChatMessageContextMenuExpose } from '@components/BaseChat/ui/ChatMessageList/types/ChatMessageContextMenu.types'

/** Размер контекстного меню сообщения, px: меню не выходит за край окна */
const CONTEXT_MENU_WIDTH = 200
const CONTEXT_MENU_HEIGHT = 280
/** Подсветка сообщения после перехода к нему, мс */
const HIGHLIGHT_DURATION_MS = 1500
const HIGHLIGHT_CLASS = 'base-chat-message-list__item--highlighted'

/**
 * На сколько пикселей нужно прокрутить ленту, чтобы открытое меню закрылось. Мелкие сдвиги не в счёт: фокус кнопки
 * «Другие действия» у края ленты подкручивает её на несколько пикселей — меню не должно закрываться сразу после открытия.
 */
const SCROLL_CLOSE_THRESHOLD = 16

/** Прокрутка к сообщению: плавная, без анимации при системной настройке «уменьшить движение» */
function scrollBehavior(): 'auto' | 'smooth' {
	return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/**
 * Сдвиг ленты, при котором сообщение встаёт по центру видимой области (длинное — верхним краем к верху ленты).
 * Прокручивается только лента: scrollIntoView двигал бы и страницу, и панели вокруг чата.
 */
function centerOffset(container: HTMLElement, element: HTMLElement): number {
	const top = container.getBoundingClientRect().top + container.clientTop
	const rect = element.getBoundingClientRect()
	return rect.top - top - Math.max(0, (container.clientHeight - rect.height) / 2)
}

/** Подсветка сообщения после перехода к нему; переход к следующему снимает подсветку с предыдущего */
function useMessageHighlight(): (element: HTMLElement) => void {
	let current: { element: HTMLElement; timer: ReturnType<typeof setTimeout> } | null = null
	const clear = (): void => {
		if (!current) return
		clearTimeout(current.timer)
		current.element.classList.remove(HIGHLIGHT_CLASS)
		current = null
	}
	onBeforeUnmount(clear)
	return element => {
		clear()
		element.classList.add(HIGHLIGHT_CLASS)
		current = { element, timer: setTimeout(clear, HIGHLIGHT_DURATION_MS) }
	}
}

/**
 * Найти элемент сообщения `message-<id>` внутри ленты. id сообщений приходят из данных приложения и могут содержать
 * `.`, `:`, `$`, пробелы (Matrix, Firebase, составные ключи) — поэтому поиск по id, а не CSS-селектором. Ищется в корне
 * ленты (документ или shadow root), так что лента внутри веб-компонента тоже работает
 */
function findMessageElement(container: HTMLElement, messageId: string): HTMLElement | null {
	const root = container.getRootNode()
	if (!(root instanceof Document || root instanceof ShadowRoot)) return null
	const element = root.getElementById(`message-${messageId}`)
	return element && container.contains(element) ? element : null
}

/** Описание: управляет действиями над сообщениями чата — контекстное меню, реакции, ответ, копирование, пин, удаление и скролл к сообщению */
function useChatMessageActions(options: UseChatMessageActionsOptions) {
	const { selectedMessageIds, emit } = options

	const listRef = ref<HTMLElement | null>(null)
	const contextMenuRef = ref<ChatMessageContextMenuExpose | null>(null)
	const highlight = useMessageHighlight()

	/** Элемент с фокусом до открытия меню (кнопка «Другие действия»): после закрытия из меню фокус возвращается на него */
	let returnFocusTarget: HTMLElement | null = null
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
		const menuWidth = CONTEXT_MENU_WIDTH
		const menuHeight = CONTEXT_MENU_HEIGHT
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
		const element = findMessageElement(container, messageId)
		if (!element) return

		container.scrollBy({ top: centerOffset(container, element), behavior: scrollBehavior() })
		highlight(element)
	}

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

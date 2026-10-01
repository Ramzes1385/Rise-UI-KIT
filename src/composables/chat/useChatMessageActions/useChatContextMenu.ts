/** Composable: контекстное меню сообщения чата — открытие, закрытие и пункты меню */
import { computed, ref } from 'vue'
import { copyTextToClipboard } from '@utils/dom/clipboardUtils'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { ChatMessageContextMenuExpose } from '@components/BaseChat/ui/ChatMessageList/types/ChatMessageContextMenu.types'
import type { ChatContextMenuState, UseChatContextMenuOptions, UseChatMessageActionsOptions } from './types/useChatMessageActions.types'

/** Размер контекстного меню сообщения, px: меню не выходит за край окна */
const CONTEXT_MENU_WIDTH = 200
const CONTEXT_MENU_HEIGHT = 280
/** Отступ меню от края окна, px */
const CONTEXT_MENU_GAP = 16

/**
 * На сколько пикселей нужно прокрутить ленту, чтобы открытое меню закрылось. Мелкие сдвиги не в счёт: фокус кнопки
 * «Другие действия» у края ленты подкручивает её на несколько пикселей — меню не должно закрываться сразу после открытия.
 */
const SCROLL_CLOSE_THRESHOLD = 16

/** Координата меню по одной оси: у курсора, но не дальше края окна */
function clampToWindow(position: number, size: number, windowSize: number): number {
	/* istanbul ignore next — boundary */
	const fitted = position + size > windowSize ? windowSize - size - CONTEXT_MENU_GAP : position
	return Math.max(CONTEXT_MENU_GAP, fitted)
}

/** Описание: состояние контекстного меню сообщения — открытие у курсора, закрытие кликом снаружи, прокруткой ленты и с возвратом фокуса */
function useChatContextMenu(options: UseChatContextMenuOptions) {
	const { listRef, selectedMessageIds } = options
	const contextMenuRef = ref<ChatMessageContextMenuExpose | null>(null)
	const contextMenu = ref<ChatContextMenuState>({ isOpen: false, x: 0, y: 0, message: null })

	/** Элемент с фокусом до открытия меню (кнопка «Другие действия»): после закрытия из меню фокус возвращается на него */
	let returnFocusTarget: HTMLElement | null = null
	let scrollTopAtOpen = 0

	/**
	 * Корень ChatMessageContextMenu — <Teleport>, поэтому `$el` экземпляра — это плейсхолдер-узел,
	 * а не меню: клик по пункту считался кликом «снаружи» и закрывал меню ещё на mousedown, до click.
	 * Сравниваем с реальным DOM-элементом меню, который компонент отдаёт через defineExpose.
	 */
	const contextMenuElement = computed(() => contextMenuRef.value?.menuRef ?? null)

	function handleContextMenu(event: MouseEvent, message: ChatContextMenuState['message']): void {
		/* istanbul ignore next — defensive */
		if (selectedMessageIds.value.length > 0) return
		returnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
		scrollTopAtOpen = listRef.value?.scrollTop ?? 0
		contextMenu.value = {
			isOpen: true,
			x: clampToWindow(event.clientX, CONTEXT_MENU_WIDTH, window.innerWidth),
			y: clampToWindow(event.clientY, CONTEXT_MENU_HEIGHT, window.innerHeight),
			message,
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

	useClickOutside({ targets: [contextMenuElement], callback: closeContextMenu, isActive: () => contextMenu.value.isOpen })

	return { contextMenuRef, contextMenu, handleContextMenu, closeContextMenu, handleListScroll }
}

/** Описание: пункты контекстного меню — реакция, ответ, выбор, копирование, пин, удаление; после пункта меню закрывается */
function useChatContextMenuItems(menu: ReturnType<typeof useChatContextMenu>, emit: UseChatMessageActionsOptions['emit']) {
	const { contextMenu, closeContextMenu } = menu

	/** Пункт меню: действие над сообщением меню (если оно есть), затем закрытие */
	const menuItem = (action: (message: NonNullable<ChatContextMenuState['message']>) => void) => (): void => {
		/* istanbul ignore next — defensive */
		if (contextMenu.value.message) action(contextMenu.value.message)
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

	return {
		handleSelectReaction: (emoji: string): void => menuItem(message => emit('message-reaction', { messageId: message.id, emoji }))(),
		handleContextMenuReply: menuItem(message => emit('message-reply', message)),
		handleContextMenuSelect: menuItem(message => emit('message-select', message.id)),
		handleContextMenuCopy,
		handleContextMenuPin: menuItem(message => emit('pin-message', message.id)),
		handleContextMenuDelete: menuItem(message => emit('delete-message', message.id)),
	}
}

export { useChatContextMenu, useChatContextMenuItems }

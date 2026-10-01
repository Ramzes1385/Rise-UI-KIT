/** Composable: контекстное меню медиа в редакторе (изменение размера, удаление) */
import { reactive, ref } from 'vue'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { MediaContextMenuState } from './types/useEditorToolbar.types'
import type { UseToolbarMediaMenuOptions } from './types/useToolbarMediaMenu.types'
import { applyMenuSize, createMediaMenuState, getMediaTarget, openMediaMenu } from './helpers/mediaMenu'

/**
 * Composable для контекстного меню медиа в редакторе: изменение размера изображений/видео, скрытие/удаление.
 */
function useToolbarMediaMenu(options: UseToolbarMediaMenuOptions) {
	const { onInput, isReadonly } = options

	const contextMenu = reactive<MediaContextMenuState>(createMediaMenuState())
	const contextMenuRef = ref<HTMLElement | null>(null)

	function handleContextMenu(event: MouseEvent): void {
		// В режиме чтения медиа менять нельзя: собственное меню не открываем и оставляем нативное меню браузера
		if (isReadonly?.()) return
		const target = getMediaTarget(event)
		if (!target) return
		event.preventDefault()
		openMediaMenu(contextMenu, target, event)
	}

	function closeContextMenu(): void {
		contextMenu.isVisible = false
		contextMenu.element = null
		contextMenu.width = ''
		contextMenu.height = ''
	}

	/** Действие над элементом меню, затем меню закрывается. Меню могло остаться открытым, если режим чтения включили уже после его открытия */
	function withMenuElement(action: (el: HTMLElement) => void): void {
		const el = contextMenu.element
		if (!el) return
		if (isReadonly?.()) {
			closeContextMenu()
			return
		}
		action(el)
		closeContextMenu()
		onInput()
	}

	useClickOutside({
		targets: [contextMenuRef],
		callback: closeContextMenu,
		isActive: () => contextMenu.isVisible,
	})

	return {
		contextMenu,
		contextMenuRef,
		handleContextMenu,
		applyMediaSize: () => withMenuElement(el => applyMenuSize(contextMenu, el)),
		removeMedia: () => withMenuElement(el => el.remove()),
		closeContextMenu,
	}
}

export { useToolbarMediaMenu }

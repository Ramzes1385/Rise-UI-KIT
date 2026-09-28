/** Composable: контекстное меню медиа в редакторе (изменение размера, удаление) */
import { reactive, ref } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import type { MediaContextMenuState } from './types/useEditorToolbar.types'
import type { UseToolbarMediaMenuOptions } from './types/useToolbarMediaMenu.types'

/**
 * Composable для контекстного меню медиа в редакторе: изменение размера изображений/видео, скрытие/удаление.
 */
function useToolbarMediaMenu(options: UseToolbarMediaMenuOptions) {
	const { onInput, isReadonly } = options

	const contextMenu = reactive<MediaContextMenuState>({
		isVisible: false,
		x: 0,
		y: 0,
		element: null,
		width: '',
		height: '',
	})
	const contextMenuRef = ref<HTMLElement | null>(null)

	function handleContextMenu(event: MouseEvent): void {
		// В режиме чтения медиа менять нельзя: собственное меню не открываем и оставляем нативное меню браузера
		if (isReadonly?.()) return
		const target = event.target
		if (!(target instanceof HTMLElement)) return
		if (target.tagName !== 'IMG' && target.tagName !== 'VIDEO') return
		event.preventDefault()
		contextMenu.isVisible = true
		contextMenu.x = event.clientX
		contextMenu.y = event.clientY
		contextMenu.element = target
		const rect = target.getBoundingClientRect()
		contextMenu.width = String(Math.round(rect.width))
		contextMenu.height = String(Math.round(rect.height))
	}

	/** Меню могло остаться открытым, если режим чтения включили уже после его открытия */
	function closeIfReadonly(): boolean {
		if (!isReadonly?.()) return false
		closeContextMenu()
		return true
	}

	function applyMediaSize(): void {
		if (!contextMenu.element) return
		if (closeIfReadonly()) return
		const el = contextMenu.element
		if (contextMenu.width) el.style.width = contextMenu.width + 'px'
		if (contextMenu.height) el.style.height = contextMenu.height + 'px'
		closeContextMenu()
		onInput()
	}

	function removeMedia(): void {
		if (!contextMenu.element) return
		if (closeIfReadonly()) return
		contextMenu.element.remove()
		closeContextMenu()
		onInput()
	}

	function closeContextMenu(): void {
		contextMenu.isVisible = false
		contextMenu.element = null
		contextMenu.width = ''
		contextMenu.height = ''
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
		applyMediaSize,
		removeMedia,
		closeContextMenu,
	}
}

export { useToolbarMediaMenu }

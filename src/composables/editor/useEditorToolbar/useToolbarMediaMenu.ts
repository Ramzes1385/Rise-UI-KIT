/** Composable: контекстное меню медиа в редакторе (изменение размера, удаление) */
import { reactive, ref, shallowRef } from 'vue'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { MediaContextMenuState } from './types/useEditorToolbar.types'
import type { UseToolbarMediaMenuOptions } from './types/useToolbarMediaMenu.types'
import {
	applyMenuSize,
	createMediaMenuState,
	findSelectedMedia,
	getMediaTarget,
	openMediaMenu,
	openMediaMenuBelow,
} from './helpers/mediaMenu'

/** Изображение или видео, выделенное целиком: для него доступна кнопка панели и клавиша меню, без правой кнопки мыши */
function useMediaSelection(options: UseToolbarMediaMenuOptions, contextMenu: MediaContextMenuState) {
	const selectedMedia = shallowRef<HTMLElement | null>(null)
	return {
		selectedMedia,
		refreshMediaSelection(): void {
			selectedMedia.value = findSelectedMedia(options.editorRef.value)
		},
		openSelectedMediaMenu(): void {
			const media = selectedMedia.value
			if (options.isReadonly?.() || !media?.isConnected) return
			openMediaMenuBelow(contextMenu, media)
		},
	}
}

/**
 * Composable для контекстного меню медиа в редакторе: изменение размера изображений/видео, скрытие/удаление.
 */
function useToolbarMediaMenu(options: UseToolbarMediaMenuOptions) {
	const { onInput, isReadonly } = options

	const contextMenu = reactive<MediaContextMenuState>(createMediaMenuState())
	const contextMenuRef = ref<HTMLElement | null>(null)
	const selection = useMediaSelection(options, contextMenu)

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
		...selection,
		applyMediaSize: () => withMenuElement(el => applyMenuSize(contextMenu, el)),
		removeMedia: () => withMenuElement(el => el.remove()),
		closeContextMenu,
	}
}

export { useToolbarMediaMenu }

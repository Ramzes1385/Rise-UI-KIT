import { reactive, ref } from 'vue'

import { useClickOutside } from '@composables/useClickOutside'
import type { MediaContextMenuState } from './useEditorToolbar.types'

interface UseToolbarMediaMenuOptions {
	onInput: () => void
}

function useToolbarMediaMenu(options: UseToolbarMediaMenuOptions) {
	const { onInput } = options

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

	function applyMediaSize(): void {
		if (!contextMenu.element) return
		const el = contextMenu.element
		if (contextMenu.width) el.style.width = contextMenu.width + 'px'
		if (contextMenu.height) el.style.height = contextMenu.height + 'px'
		closeContextMenu()
		onInput()
	}

	function removeMedia(): void {
		if (!contextMenu.element) return
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
export type { UseToolbarMediaMenuOptions }

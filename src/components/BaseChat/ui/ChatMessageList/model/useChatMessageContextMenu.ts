import type { Ref } from 'vue'
import { useLayerIndex } from '@composables/app/useLayerStack'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { useInheritedThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'
import type { ChatMessageContextMenuEmits, ChatMessageContextMenuProps } from '../types/ChatMessageContextMenu.types'

function getItems(menu: HTMLElement | null): HTMLElement[] {
	return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

function createMenuKeydown(menuRef: Ref<HTMLElement | null>, emit: ChatMessageContextMenuEmits) {
	return (event: KeyboardEvent): void => {
		const items = getItems(menuRef.value)
		const currentIndex = items.indexOf(document.activeElement as HTMLElement)
		const moves: Record<string, number> = {
			ArrowDown: currentIndex + 1,
			ArrowRight: currentIndex + 1,
			ArrowUp: currentIndex - 1,
			ArrowLeft: currentIndex - 1,
			Home: 0,
			End: items.length - 1,
		}
		if (event.key in moves) {
			event.preventDefault()
			items[(moves[event.key] + items.length) % items.length]?.focus()
			return
		}
		if (event.key === 'Escape' || event.key === 'Tab') {
			event.preventDefault()
			emit('close')
		}
	}
}

export function useChatMessageContextMenu(props: ChatMessageContextMenuProps, emit: ChatMessageContextMenuEmits) {
	const teleportTarget = useTeleportTarget()
	const menuRef = ref<HTMLElement | null>(null)
	const instance = getCurrentInstance()
	const inheritedTheme = useInheritedThemeAttrs(
		() => (instance?.proxy?.$el as Node | null | undefined)?.parentElement,
		() => props.isOpen,
	)
	const layerStyle = useLayerIndex(() => props.isOpen)
	watch(
		() => props.isOpen,
		isOpen => {
			if (isOpen) nextTick(() => getItems(menuRef.value)[0]?.focus())
		},
		{ immediate: true },
	)

	return {
		teleportTarget,
		menuRef,
		inheritedTheme,
		layerStyle,
		menuStyle: computed(() => ({
			top: `${props.y}px`,
			left: `${props.x}px`,
			'--size-scale': String(props.sizeScale / SIZE_SCALE_DEFAULT),
		})),
		handleKeydown: createMenuKeydown(menuRef, emit),
		handleReaction: (emoji: string): void => emit('reaction', emoji),
		handleReply: (): void => emit('reply'),
		handleSelect: (): void => emit('select'),
		handleCopy: (): void => emit('copy'),
		handleEdit: (): void => emit('edit'),
		handlePin: (): void => emit('pin'),
		handleDelete: (): void => emit('delete'),
		exposed: { menuRef },
	}
}

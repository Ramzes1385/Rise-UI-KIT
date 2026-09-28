/** Composable: логика ChatMessageContextMenu — меню действий с сообщением: положение, тема, фокус и клавиатура */
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { useLayerIndex } from '@composables/useLayerStack'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import type { Ref } from 'vue'
import type { ChatMessageContextMenuEmits, ChatMessageContextMenuProps } from '../types/ChatMessageContextMenu.types'

function getItems(menu: HTMLElement | null): HTMLElement[] {
	return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

/**
 * Клавиатура меню: ↓/→ — следующий пункт, ↑/← — предыдущий (по кругу), Home/End — первый и последний.
 * Escape и Tab закрывают меню; фокус возвращает useChatMessageActions
 */
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
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const menuRef = ref<HTMLElement | null>(null)
	// Тема блока с чатом: меню в body иначе взяло бы тему страницы. Корень компонента — Teleport, его метка остаётся
	// в списке сообщений: от неё ищется ближайший `data-theme`
	const instance = getCurrentInstance()
	const inheritedTheme = useInheritedTheme(
		() => (instance?.proxy?.$el as Node | null | undefined)?.parentElement,
		() => props.isOpen,
	)
	// Место меню среди открытых слоёв: меню чата в окне — над окном
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
		// Меню телепортировано в body и не наследует --size-scale чата: масштаб передаётся явно
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
		handlePin: (): void => emit('pin'),
		handleDelete: (): void => emit('delete'),
		exposed: { menuRef },
	}
}

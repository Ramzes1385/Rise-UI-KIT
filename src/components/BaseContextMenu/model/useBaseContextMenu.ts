import { computed, nextTick, ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useCustomClass } from '@composables/base/useCustomClass'
import { getFixedOrigin, toFixedSpace } from '@utils/dom/domUtils'
import type DropdownMenuContent from '@components/BaseDropdownMenu/ui/DropdownMenuContent.vue'
import type { BaseContextMenuEmits, BaseContextMenuProps } from '../types/BaseContextMenu.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'
import type { DropdownMenuContentPart } from '@components/BaseDropdownMenu/types/DropdownMenuContent.types'

function useMenuOpening(emit: BaseContextMenuEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const contentRef = ref<InstanceType<typeof DropdownMenuContent> | null>(null)
	const isOpen = ref(false)
	const point = ref({ x: 0, y: 0 })
	let returnFocus: HTMLElement | null = null

	const setOpen = (value: boolean): void => {
		if (value === isOpen.value) return
		isOpen.value = value
		emit('update:isOpen', value)
	}

	return {
		rootRef,
		contentRef,
		isOpen,
		point,
		setOpen,
		async openAt(x: number, y: number, focusFirst = false): Promise<void> {
			returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
			const origin = getFixedOrigin(rootRef.value)
			point.value = toFixedSpace(origin, x, y)
			setOpen(true)
			await nextTick()
			if (focusFirst) contentRef.value?.focusFirst()
			else contentRef.value?.focusMenu()
		},
		restoreFocus: (): void => {
			if (returnFocus?.isConnected) returnFocus.focus()
		},
	}
}

function useMenuUi(props: BaseContextMenuProps) {
	const ui = useUi(props, 'base-context-menu')
	return {
		ui,
		menuUi: (part: DropdownMenuContentPart | 'root'): string => `base-dropdown-menu__${part} ${ui(part)}`,
	}
}

export function useBaseContextMenu(props: BaseContextMenuProps, emit: BaseContextMenuEmits) {
	const { rootRef, contentRef, isOpen, point, setOpen, openAt, restoreFocus } = useMenuOpening(emit)

	return {
		...useMenuUi(props),
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'panel', 'item', 'label', 'separator'] }),
		rootRef,
		contentRef,
		isOpen,
		setOpen,
		anchorStyle: computed(() => ({ left: `${point.value.x}px`, top: `${point.value.y}px` })),
		handleContextMenu(event: MouseEvent): void {
			if (props.isDisabled) return
			event.preventDefault()
			void openAt(event.clientX, event.clientY)
		},
		handleKeydown(event: KeyboardEvent): void {
			const isMenuKey = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
			if (!isMenuKey || props.isDisabled) return
			event.preventDefault()
			const rect = (event.target as Element).getBoundingClientRect()
			void openAt(rect.left, rect.bottom, true)
		},
		handleSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
			emit('select', item, event)
			if (!shouldClose) return
			setOpen(false)
			restoreFocus()
		},
		exposed: { openAt: (x: number, y: number) => void openAt(x, y), close: () => setOpen(false) },
	}
}

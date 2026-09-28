import { computed, nextTick, ref } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import type DropdownMenuContent from '@components/BaseDropdownMenu/ui/DropdownMenuContent.vue'
import type { BaseContextMenuEmits, BaseContextMenuProps } from '../types/BaseContextMenu.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

function useMenuOpening(emit: BaseContextMenuEmits) {
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
		contentRef,
		isOpen,
		point,
		setOpen,
		async openAt(x: number, y: number, focusFirst = false): Promise<void> {
			returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
			point.value = { x, y }
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

export function useBaseContextMenu(props: BaseContextMenuProps, emit: BaseContextMenuEmits) {
	const { contentRef, isOpen, point, setOpen, openAt, restoreFocus } = useMenuOpening(emit)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'panel', 'item', 'label', 'separator'] }),
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

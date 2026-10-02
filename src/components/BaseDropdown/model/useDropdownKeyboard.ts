import { useFocusTrap } from '@composables/overlay/useFocusTrap'
import { getTabbableElements } from '@composables/overlay/useFocusTrap/useFocusTrap'
import type { DropdownItemStep, DropdownKeyboardRefs, DropdownProps } from '../types/BaseDropdown.types'

const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"]'

const ITEM_STEPS: Record<string, DropdownItemStep> = {
	ArrowDown: (index, count) => (index + 1) % count,
	ArrowUp: (index, count) => (index - 1 + count) % count,
	Home: () => 0,
	End: (_index, count) => count - 1,
}

function isEnabledItem(element: HTMLElement): boolean {
	return element.getAttribute('aria-disabled') !== 'true' && !element.hasAttribute('disabled') && !element.closest('[hidden]')
}

function moveItemFocus(event: KeyboardEvent, panel: HTMLElement): void {
	const step = ITEM_STEPS[event.key]
	const items = Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(isEnabledItem)
	const index = items.findIndex(item => item.contains(event.target as Node))
	if (!step || index < 0) return
	event.preventDefault()
	items[step(index, items.length)]?.focus()
}

function isLeavingPanel(event: KeyboardEvent, panel: HTMLElement): boolean {
	const target = event.target as Node
	const direction = event.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING
	return !getTabbableElements(panel).some(element => element !== target && (target.compareDocumentPosition(element) & direction) !== 0)
}

function findTrigger(refs: DropdownKeyboardRefs): HTMLElement | null {
	const saved = refs.savedActiveElement.value
	if (saved?.isConnected) return saved
	const wrapper = refs.wrapperRef.value
	return wrapper ? (getTabbableElements(wrapper)[0] ?? null) : null
}

export function useDropdownKeyboard(props: DropdownProps, close: () => void, refs: DropdownKeyboardRefs) {
	const isDialog = (): boolean => props.trapFocus === true

	useFocusTrap({ containerRef: refs.dropdownRef, isActive: () => props.isOpen && isDialog() })

	function handleTab(event: KeyboardEvent, panel: HTMLElement): void {
		if (isDialog() || !isLeavingPanel(event, panel)) return
		event.preventDefault()
		findTrigger(refs)?.focus()
		close()
	}

	return {
		isDialog,
		handlePanelKeydown(event: KeyboardEvent): void {
			const panel = refs.dropdownRef.value
			if (event.defaultPrevented || !panel) return
			if (event.key === 'Tab') handleTab(event, panel)
			else moveItemFocus(event, panel)
		},
	}
}

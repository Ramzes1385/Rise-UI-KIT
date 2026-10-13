import { onMounted, onUpdated, ref } from 'vue'

const ITEM_SELECTOR = 'button, [role="combobox"]'
const OVERLAY_SELECTOR = '[role="dialog"], [role="listbox"], [role="menu"]'
const MOVE_KEYS = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

function listItems(root: HTMLElement | null): HTMLElement[] {
	if (!root) return []
	return Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
		item => !item.hasAttribute('disabled') && !item.closest(OVERLAY_SELECTOR),
	)
}

function nextIndex(key: string, index: number, count: number): number {
	if (key === 'Home') return 0
	if (key === 'End') return count - 1
	return (index + (key === 'ArrowRight' ? 1 : -1) + count) % count
}

export function useToolbarRoving() {
	const toolbarRef = ref<HTMLElement | null>(null)
	const state = { current: null as HTMLElement | null }

	function sync(): void {
		const items = listItems(toolbarRef.value)
		const active = state.current && items.includes(state.current) ? state.current : items[0]
		state.current = active ?? null
		items.forEach(item => item.setAttribute('tabindex', item === active ? '0' : '-1'))
	}

	onMounted(sync)
	onUpdated(sync)

	return {
		toolbarRef,
		sync,
		handleFocusIn(event: FocusEvent): void {
			if (!(event.target instanceof HTMLElement) || !listItems(toolbarRef.value).includes(event.target)) return
			state.current = event.target
			sync()
		},
		handleKeyDown(event: KeyboardEvent): void {
			if (!MOVE_KEYS.includes(event.key) || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
			const items = listItems(toolbarRef.value)
			const index = items.findIndex(item => item === event.target)
			if (index < 0) return
			event.preventDefault()
			items[nextIndex(event.key, index, items.length)].focus()
		},
	}
}

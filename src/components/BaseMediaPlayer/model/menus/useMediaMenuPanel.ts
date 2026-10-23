import { UI_PLAYER, formatMessage } from '../messages'
import { computed, nextTick, onMounted, ref } from 'vue'
import type { MediaMenuItem, MediaMenuList, MediaMenuPanelEmits, MediaMenuPanelProps } from '../../types/menus/MediaMenu.types'

const ROW_SELECTOR = '[role^="menuitem"]'

function resolve(menu: MediaMenuList, path: string[]): MediaMenuList {
	return path.reduce((list, id) => list.items.find(item => item.id === id)?.children ?? list, menu)
}

function useMenuFocus(viewRef: Readonly<{ value: HTMLElement | null }>) {
	const rows = (): HTMLElement[] => Array.from(viewRef.value?.querySelectorAll<HTMLElement>(ROW_SELECTOR) ?? [])
	return {
		rows,
		focusAt(index: number): void {
			const list = rows()
			list[(index + list.length) % list.length]?.focus()
		},
		focusChecked(): void {
			const list = rows()
			;(list.find(row => row.getAttribute('aria-checked') === 'true') ?? list[0])?.focus()
		},
	}
}

function useMenuSize(viewRef: Readonly<{ value: HTMLElement | null }>) {
	const size = ref<{ width: number; height: number } | null>(null)
	return {
		frameStyle: computed(() =>
			size.value ? { gridTemplateColumns: `${size.value.width}px`, gridTemplateRows: `${size.value.height}px` } : {},
		),
		measure(): void {
			const view = viewRef.value
			if (view) size.value = { width: view.offsetWidth, height: view.offsetHeight }
		},
	}
}

function menuKeys(menu: {
	focus: ReturnType<typeof useMenuFocus>
	current: Readonly<{ value: MediaMenuList }>
	isNested: () => boolean
	back: () => void
	choose: (item: MediaMenuItem) => void
	close: () => void
}) {
	return (event: KeyboardEvent): void => {
		const active = document.activeElement as HTMLElement | null
		const index = menu.focus.rows().indexOf(active as HTMLElement)
		const item = menu.current.value.items[Number(active?.dataset.index)]
		const keys: Record<string, () => void> = {
			ArrowDown: () => menu.focus.focusAt(index + 1),
			ArrowUp: () => menu.focus.focusAt(index - 1),
			Home: () => menu.focus.focusAt(0),
			End: () => menu.focus.focusAt(-1),
			ArrowLeft: () => menu.isNested() && menu.back(),
			ArrowRight: () => item?.children && menu.choose(item),
			Tab: menu.close,
		}
		const action = keys[event.key]
		if (!action) return
		event.preventDefault()
		action()
	}
}

export function useMediaMenuPanel(props: MediaMenuPanelProps, emit: MediaMenuPanelEmits) {
	const path = ref<string[]>([])
	const direction = ref<'forward' | 'back'>('forward')
	const viewRef = ref<HTMLElement | null>(null)
	const focus = useMenuFocus(viewRef)
	const menuSize = useMenuSize(viewRef)
	const current = computed(() => resolve(props.menu, path.value))
	const settle = async (): Promise<void> => {
		await nextTick()
		menuSize.measure()
		focus.focusChecked()
	}
	const go = (next: string[], to: 'forward' | 'back'): void => {
		direction.value = to
		path.value = next
		void settle()
	}
	const back = (): void => go(path.value.slice(0, -1), 'back')
	const choose = (item: MediaMenuItem): void => {
		if (item.children) return go([...path.value, item.id], 'forward')
		item.onSelect?.()
		if (current.value.isKeptOpen && path.value.length > 0) back()
		else emit('close')
	}
	onMounted(settle)

	return {
		viewRef,
		current,
		direction,
		frameStyle: menuSize.frameStyle,
		isNested: computed(() => path.value.length > 0),
		viewKey: computed(() => path.value.join('/')),
		backLabel: computed(() => formatMessage(UI_PLAYER.MENU_BACK, { title: current.value.title })),
		back,
		choose,
		onKeydown: menuKeys({ focus, current, isNested: () => path.value.length > 0, back, choose, close: () => emit('close') }),
	}
}

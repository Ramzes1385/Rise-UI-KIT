/** Composable: логика BaseToolbar — один элемент в порядке Tab и стрелки между элементами (APG Toolbar) */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { Ref } from 'vue'
import type { BaseToolbarProps } from '../types/BaseToolbar.types'

/** Элементы панели: фокусируемые и не отключённые; помеченные панелью — даже с tabindex="-1" */
const ITEM_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [data-toolbar-item]'
const NON_TEXT_INPUT_TYPES = ['button', 'checkbox', 'radio', 'submit', 'reset', 'image']

/** Текстовое поле: стрелки в нём двигают курсор, а не фокус панели */
function isTextEntry(element: HTMLElement): boolean {
	if (element.matches('textarea, [contenteditable]:not([contenteditable="false"])')) return true
	return element instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.includes(element.type)
}

/** Индекс элемента после клавиши; undefined — клавиша панели не касается */
function nextIndex(key: string, position: { index: number; count: number }, isVertical: boolean): number | undefined {
	const { index, count } = position
	const moves = new Map([
		[isVertical ? 'ArrowDown' : 'ArrowRight', (index + 1) % count],
		[isVertical ? 'ArrowUp' : 'ArrowLeft', (index - 1 + count) % count],
		['Home', 0],
		['End', count - 1],
	])
	return moves.get(key)
}

/** Один элемент в порядке Tab: последний с фокусом (или первый), остальные — tabindex="-1" */
function useRovingTabIndex(rootRef: Ref<HTMLElement | null>) {
	let active: HTMLElement | null = null
	let observer: MutationObserver | null = null

	const getItems = (): HTMLElement[] =>
		[...(rootRef.value?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])].filter(
			element => !element.matches(':disabled') && !element.closest('[inert], [aria-hidden="true"]'),
		)
	const syncTabIndex = (): void => {
		const items = getItems()
		if (!active || !items.includes(active)) active = items[0] ?? null
		for (const item of items) {
			item.setAttribute('data-toolbar-item', '')
			item.tabIndex = item === active ? 0 : -1
		}
	}

	// Кнопки появляются, исчезают и отключаются — порядок Tab пересчитывается
	onMounted(() => {
		syncTabIndex()
		observer = new MutationObserver(syncTabIndex)
		observer.observe(rootRef.value as HTMLElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
	})
	onBeforeUnmount(() => observer?.disconnect())

	return {
		getItems,
		isActive: (element: HTMLElement): boolean => element === active,
		setActive(element: HTMLElement): void {
			active = element
			syncTabIndex()
		},
	}
}

export function useBaseToolbar(props: BaseToolbarProps) {
	const standard = useStandardBaseComponent('base-toolbar', props, ['root'])
	const rootRef = ref<HTMLElement | null>(null)
	const { getItems, isActive, setActive } = useRovingTabIndex(rootRef)

	return {
		...standard,
		rootRef,
		handleKeydown(event: KeyboardEvent): void {
			const target = event.target as HTMLElement
			const items = getItems()
			const index = items.indexOf(target)
			if (index === -1 || isTextEntry(target)) return
			const targetIndex = nextIndex(event.key, { index, count: items.length }, props.orientation === 'vertical')
			if (targetIndex === undefined) return
			event.preventDefault()
			setActive(items[targetIndex])
			items[targetIndex].focus()
		},
		/** Фокус пришёл мышью или Tab'ом — этот элемент становится элементом в порядке Tab */
		handleFocusin(event: FocusEvent): void {
			const target = event.target as HTMLElement
			if (getItems().includes(target) && !isActive(target)) setActive(target)
		},
	}
}

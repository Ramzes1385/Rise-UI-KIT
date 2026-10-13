/** Composable: клавиатура панели инструментов по APG Toolbar — одна точка Tab, стрелки, Home и End */
import { onBeforeUnmount, onMounted } from 'vue'
import type { UseToolbarKeyboardOptions, UseToolbarKeyboardReturn } from './types/useToolbarKeyboard.types'

const ITEM_SELECTOR =
	'button, a[href], input:not([type="hidden"]), select, textarea, [role="combobox"], [tabindex]:not([tabindex="-1"]), [data-toolbar-item]'
const SKIPPED = '[inert], [aria-hidden="true"], [hidden], [data-toolbar-skip]'
const NON_TEXT_INPUT_TYPES = ['button', 'checkbox', 'radio', 'submit', 'reset', 'image']
const OBSERVED_ATTRIBUTES = ['disabled', 'aria-disabled', 'hidden']

function isTextEntry(element: HTMLElement): boolean {
	if (element.matches('textarea, [contenteditable]:not([contenteditable="false"])')) return true
	return element instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.includes(element.type)
}

/** В поле ввода стрелка уводит фокус, только если каретка уже у края текста в сторону движения: иначе она двигает каретку */
function isCaretAtEdge(element: HTMLElement, direction: 1 | -1): boolean {
	if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return false
	const { selectionStart, selectionEnd, value } = element
	if (selectionStart === null || selectionEnd === null) return true
	return selectionStart === selectionEnd && selectionStart === (direction === 1 ? value.length : 0)
}

function targetIndex(key: string, position: { index: number; count: number }, isVertical: boolean): number | undefined {
	const { index, count } = position
	const moves = new Map([
		[isVertical ? 'ArrowDown' : 'ArrowRight', (index + 1) % count],
		[isVertical ? 'ArrowUp' : 'ArrowLeft', (index - 1 + count) % count],
		['Home', 0],
		['End', count - 1],
	])
	return moves.get(key)
}

function arrowDirection(key: string, isVertical: boolean): 1 | -1 | 0 {
	if (key === (isVertical ? 'ArrowDown' : 'ArrowRight')) return 1
	return key === (isVertical ? 'ArrowUp' : 'ArrowLeft') ? -1 : 0
}

/** Список управляющих элементов панели и «текущий» элемент с `tabindex="0"`; список обновляется наблюдателем за разметкой */
function useRovingItems(rootRef: UseToolbarKeyboardOptions['rootRef']) {
	let active: HTMLElement | null = null
	let observer: MutationObserver | null = null

	function getItems(): HTMLElement[] {
		const candidates = [...(rootRef.value?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])]
		return candidates.filter(
			element =>
				!element.matches(':disabled') &&
				!element.closest(SKIPPED) &&
				!candidates.some(other => other !== element && other.contains(element)),
		)
	}

	function sync(): void {
		const items = getItems()
		if (!active || !items.includes(active)) active = items[0] ?? null
		for (const item of items) {
			item.setAttribute('data-toolbar-item', '')
			item.tabIndex = item === active ? 0 : -1
		}
	}

	function setActive(element: HTMLElement): void {
		active = element
		sync()
	}

	onMounted(() => {
		sync()
		if (!rootRef.value) return
		observer = new MutationObserver(sync)
		observer.observe(rootRef.value, { childList: true, subtree: true, attributes: true, attributeFilter: OBSERVED_ATTRIBUTES })
	})
	onBeforeUnmount(() => observer?.disconnect())

	return { getItems, sync, setActive, isActive: (element: HTMLElement): boolean => element === active }
}

/**
 * Клавиатура панели инструментов (APG Toolbar): Tab попадает на панель одной остановкой — последний сфокусированный
 * элемент (или первый), остальные получают `tabindex="-1"`; стрелки вдоль панели, Home и End переносят фокус по кругу.
 * Поля ввода участвуют в обходе, но стрелки в них двигают каретку и уводят фокус, только когда она у края текста
 * (Home и End в поле ввода остаются за ним). Меню и списки выбора, открытые из панели, обрабатывают клавиши сами.
 *
 * @example
 * ```ts
 * const rootRef = ref<HTMLElement | null>(null)
 * const { handleKeydown, handleFocusin } = useToolbarKeyboard({ rootRef })
 * // <div ref="rootRef" role="toolbar" aria-label="…" @keydown="handleKeydown" @focusin="handleFocusin">…</div>
 * ```
 */
function useToolbarKeyboard(options: UseToolbarKeyboardOptions): UseToolbarKeyboardReturn {
	const { rootRef } = options
	const isVertical = (): boolean => options.orientation?.() === 'vertical'
	const roving = useRovingItems(rootRef)

	function handleKeydown(event: KeyboardEvent): void {
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
		const target = event.target as HTMLElement
		const items = roving.getItems()
		const index = items.indexOf(target)
		if (index === -1) return
		if (isTextEntry(target)) {
			const direction = arrowDirection(event.key, isVertical())
			if (!direction || !isCaretAtEdge(target, direction)) return
		}
		const next = targetIndex(event.key, { index, count: items.length }, isVertical())
		if (next === undefined) return
		event.preventDefault()
		roving.setActive(items[next])
		items[next].focus()
	}

	function handleFocusin(event: FocusEvent): void {
		const target = event.target as HTMLElement
		if (roving.getItems().includes(target) && !roving.isActive(target)) roving.setActive(target)
	}

	function focusItem(index: number): void {
		const items = roving.getItems()
		const target = items.at(index < 0 ? index : Math.min(index, items.length - 1))
		if (!target) return
		roving.setActive(target)
		target.focus()
	}

	return { getItems: roving.getItems, handleKeydown, handleFocusin, sync: roving.sync, focusItem }
}

export { useToolbarKeyboard }

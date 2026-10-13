/** Composable: перенос фокуса со скрываемого блока на следующий фокусируемый элемент, чтобы он не терялся в body */
import { getTabbableElements } from '@composables/overlay/useFocusTrap/useFocusTrap'
import type { UseDismissFocusOptions, UseDismissFocusReturn } from './types/useDismissFocus.types'

function findNextTabbable(root: HTMLElement): HTMLElement | null {
	const isAfterRoot = (element: HTMLElement): boolean =>
		!root.contains(element) && Boolean(root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
	return getTabbableElements(root.ownerDocument.body).find(isAfterRoot) ?? null
}

export function useDismissFocus({ elementRef }: UseDismissFocusOptions): UseDismissFocusReturn {
	return {
		releaseFocus(): void {
			const root = elementRef.value
			const active = root?.ownerDocument.activeElement
			if (!root || !(active instanceof HTMLElement) || !root.contains(active)) return
			const next = findNextTabbable(root)
			if (next) next.focus()
			else active.blur()
		},
	}
}

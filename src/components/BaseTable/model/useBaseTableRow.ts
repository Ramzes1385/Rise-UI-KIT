import { computed } from 'vue'
import type { BaseTableRowEmits, BaseTableRowProps } from '../types/body/BaseTableRow.types'

const EXPAND_BUTTON_PADDING = { x: 3, y: 3 }
const INTERACTIVE_TARGET = 'a, button, input, select, textarea, label, [role="button"], [role="link"], [contenteditable="true"]'
const ROW_SELECTOR = 'tr[data-row-interactive]'
const ACTIVATION_KEYS = new Set(['Enter', ' '])
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End'])

function isFromInteractiveContent(event: Event): boolean {
	const target = event.target as Element
	const control = target.closest(INTERACTIVE_TARGET)
	return Boolean(control && control !== event.currentTarget && (event.currentTarget as Element).contains(control))
}

function focusSiblingRow(row: HTMLElement, key: string): void {
	const rows = [...(row.closest('tbody') as HTMLElement).querySelectorAll<HTMLElement>(ROW_SELECTOR)]
	const index = rows.indexOf(row)
	const targets: Record<string, number> = { ArrowUp: index - 1, ArrowDown: index + 1, Home: 0, End: rows.length - 1 }
	rows[Math.min(Math.max(targets[key], 0), rows.length - 1)].focus()
}

export function useBaseTableRow(props: BaseTableRowProps, emit: BaseTableRowEmits) {
	return {
		expandButtonPadding: EXPAND_BUTTON_PADDING,
		isExpandable: computed(() => Boolean(props.row.isExpandable || props.row.children?.length)),
		onClick(event: MouseEvent): void {
			if (!isFromInteractiveContent(event)) emit('row-click', props.row)
		},
		onKeydown(event: KeyboardEvent): void {
			if (!props.isInteractive || event.target !== event.currentTarget) return
			if (ACTIVATION_KEYS.has(event.key)) {
				event.preventDefault()
				emit('row-click', props.row)
			} else if (NAVIGATION_KEYS.has(event.key)) {
				event.preventDefault()
				focusSiblingRow(event.currentTarget as HTMLElement, event.key)
			}
		},
	}
}

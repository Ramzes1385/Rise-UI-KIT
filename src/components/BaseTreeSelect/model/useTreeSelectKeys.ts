import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { resolveArrowKey } from '@utils/dom/directionUtils'
import type { TreeSelectKeyAction, TreeSelectKeysContext, TreeSelectRow } from '../types/BaseTreeSelect.types'

const CLOSED_KEYS = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'])
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End'])

function arrowRight(context: TreeSelectKeysContext, row: TreeSelectRow | undefined): void {
	if (!row?.hasChildren) return
	if (row.isExpanded) context.moveTo(context.activeIndex.value + 1)
	else context.toggleRow(row)
}

function arrowLeft(context: TreeSelectKeysContext, row: TreeSelectRow | undefined): void {
	if (!row) return
	if (row.isExpanded && !row.node.isDisabled) {
		context.toggleRow(row)
		return
	}
	const parentIndex = context.rows.value.findIndex(({ node }) => node.id === row.parentId)
	if (parentIndex !== -1) context.moveTo(parentIndex)
}

function selectActive(context: TreeSelectKeysContext, row: TreeSelectRow | undefined): void {
	if (row) context.selectRow(row)
}

const moveToFirst: TreeSelectKeyAction = context => context.moveTo(0)
const moveToLast: TreeSelectKeyAction = context => context.moveTo(context.rows.value.length - 1)

const OPEN_KEYS = new Map<string, TreeSelectKeyAction>([
	['ArrowDown', context => context.moveTo(context.activeIndex.value + 1)],
	['ArrowUp', context => context.moveTo(context.activeIndex.value - 1)],
	['Home', moveToFirst],
	['End', moveToLast],
	['ArrowRight', arrowRight],
	['ArrowLeft', arrowLeft],
	['Enter', selectActive],
	[' ', selectActive],
])

const EDGE_KEYS = new Map<string, TreeSelectKeyAction>([
	['Home', moveToFirst],
	['End', moveToLast],
])

function isCaretKey(context: TreeSelectKeysContext, event: KeyboardEvent, isSearch: boolean): boolean {
	if (!isSearch) return false
	if (event.key === ' ') return true
	return CARET_KEYS.has(event.key) && context.searchQuery.value !== ''
}

function handleOpenKey(context: TreeSelectKeysContext, event: KeyboardEvent, isSearch: boolean): void {
	if (event.key === 'Tab') {
		if (isSearch) event.preventDefault()
		context.close()
		return
	}
	if (event.key === 'ArrowUp' && event.altKey) {
		event.preventDefault()
		context.close()
		return
	}
	const action = OPEN_KEYS.get(resolveArrowKey(event))
	if (!action || isCaretKey(context, event, isSearch)) return
	event.preventDefault()
	action(context, context.rows.value[context.activeIndex.value])
}

export function useTreeSelectKeys(context: TreeSelectKeysContext) {
	return {
		handleKeydown(event: KeyboardEvent, isSearch = false): void {
			if (context.isDisabled() || isImeKeydown(event)) return
			if (context.isOpen.value) {
				handleOpenKey(context, event, isSearch)
				return
			}
			if (!CLOSED_KEYS.has(event.key)) return
			event.preventDefault()
			context.open()
			EDGE_KEYS.get(event.key)?.(context, undefined)
		},
	}
}

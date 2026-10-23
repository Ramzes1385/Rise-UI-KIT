import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { resolveArrowKey } from '@utils/dom/directionUtils'
import type { CascaderKeyActions, CascaderKeyHandler } from '../types/BaseCascader.types'

const openOr =
	(action: CascaderKeyHandler): CascaderKeyHandler =>
	actions => {
		if (actions.isOpen.value) action(actions)
		else actions.open()
	}

const whenOpen =
	(action: CascaderKeyHandler): CascaderKeyHandler =>
	actions => {
		if (actions.isOpen.value) action(actions)
	}

const atEdge =
	(edge: 'first' | 'last'): CascaderKeyHandler =>
	actions => {
		actions.open()
		actions.moveToEdge(edge)
	}

const COLUMN_KEYS: Record<string, CascaderKeyHandler> = {
	Enter: openOr(actions => actions.activate()),
	' ': openOr(actions => actions.activate()),
	ArrowDown: openOr(actions => actions.move(1)),
	ArrowUp: openOr(actions => actions.move(-1)),
	ArrowRight: whenOpen(actions => actions.forward()),
	ArrowLeft: whenOpen(actions => actions.back()),
	Home: atEdge('first'),
	End: atEdge('last'),
}

const RESULT_KEYS: Record<string, CascaderKeyHandler> = {
	ArrowDown: actions => actions.moveResult(1),
	ArrowUp: actions => actions.moveResult(-1),
	Enter: actions => actions.chooseResult(),
}

const SEARCH_TEXT_KEYS = new Set([' ', 'Home', 'End'])

function runKey(event: KeyboardEvent, handler: CascaderKeyHandler | undefined, actions: CascaderKeyActions): void {
	if (!handler) return
	event.preventDefault()
	handler(actions)
}

export function useCascaderKeyboard(actions: CascaderKeyActions) {
	function closeOnTab(event: KeyboardEvent): boolean {
		if (event.key !== 'Tab' || !actions.isOpen.value) return false
		actions.close()
		return true
	}

	return {
		handleTriggerKeydown(event: KeyboardEvent): void {
			if (actions.isDisabled() || closeOnTab(event)) return
			runKey(event, COLUMN_KEYS[resolveArrowKey(event)], actions)
		},
		handleSearchKeydown(event: KeyboardEvent): void {
			if (isImeKeydown(event)) return
			if (closeOnTab(event)) {
				event.preventDefault()
				return
			}
			if (actions.isSearching()) runKey(event, RESULT_KEYS[event.key], actions)
			else if (!SEARCH_TEXT_KEYS.has(event.key)) runKey(event, COLUMN_KEYS[resolveArrowKey(event)], actions)
		},
	}
}

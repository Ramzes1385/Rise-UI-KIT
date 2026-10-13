import { ref } from 'vue'
import { layoutsEqual, moveItem, resizeItem } from '../layout/dashboardLayout'
import type { DashboardGridState, DashboardLayoutItem } from '../../types/BaseDashboardGrid.types'

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
const PICK_KEYS = ['Enter', ' ']

const findIn = (items: DashboardLayoutItem[], id: string): DashboardLayoutItem => items.find(item => item.id === id) as DashboardLayoutItem

function stepItem(state: DashboardGridState, id: string, change: { delta: [number, number]; isResize: boolean }): void {
	const base = state.draft.value ?? state.layout.value
	const item = findIn(base, id)
	const [dx, dy] = change.delta
	const next = change.isResize
		? resizeItem(base, { id, w: item.w + dx, h: item.h + dy }, state.rules())
		: moveItem(base, { id, x: item.x + dx, y: item.y + dy }, state.rules())
	state.draft.value = next
	state.announce('MOVED', findIn(next, id))
}

function dropItem(state: DashboardGridState, id: string): void {
	const next = state.draft.value
	const before = findIn(state.layout.value, id)
	if (next && !layoutsEqual(next, state.layout.value)) {
		const after = findIn(next, id)
		state.commit(next, id, after.w !== before.w || after.h !== before.h ? 'resize' : 'move')
	} else state.draft.value = null
	state.announce('DROPPED', findIn(state.layout.value, id))
}

function cancelItem(state: DashboardGridState, id: string): void {
	state.draft.value = null
	state.announce('CANCELLED', findIn(state.layout.value, id))
}

export function useDashboardGridKeyboard(state: DashboardGridState) {
	const grabbedId = ref<string | null>(null)

	function act(event: KeyboardEvent, id: string): void {
		if (event.key === 'Escape') {
			event.stopPropagation()
			grabbedId.value = null
			cancelItem(state, id)
		} else if (PICK_KEYS.includes(event.key)) {
			grabbedId.value = null
			dropItem(state, id)
		} else if (event.key in ARROWS) stepItem(state, id, { delta: ARROWS[event.key], isResize: event.shiftKey })
		else return
		event.preventDefault()
	}

	return {
		grabbedId,
		handleKeydown(event: KeyboardEvent): void {
			const id = (event.target as HTMLElement).dataset.itemId
			const item = state.layout.value.find(other => other.id === id)
			if (!item || item.isStatic || !state.isInteractive.value) return
			if (grabbedId.value === id) {
				act(event, item.id)
				return
			}
			if (!PICK_KEYS.includes(event.key)) return
			event.preventDefault()
			grabbedId.value = item.id
			state.draft.value = state.layout.value
			state.announce('PICKED', item)
		},
		handleFocusOut(event: FocusEvent): void {
			const target = event.target as HTMLElement
			if (grabbedId.value && target.dataset.itemId === grabbedId.value && !target.contains(event.relatedTarget as Node | null)) {
				const id = grabbedId.value
				grabbedId.value = null
				cancelItem(state, id)
			}
		},
		reset(): void {
			grabbedId.value = null
		},
	}
}

/** Утилиты: хранилище стеков истории команд */
import { shallowRef } from 'vue'
import type { CommandHistoryEntry } from '../types/useCommandHistory.types'
import type { HistoryStore, StackEntry } from '../types/historyInternal.types'
import { canMerge, mergeEntries, toHistoryList, toHistoryState, trimStack } from './historyStacks'

/** Стеки отмены и повтора с общим состоянием */
export function createHistoryStore<C>(limit: number, window: number): HistoryStore<C> {
	const undoStack: StackEntry<C>[] = []
	const redoStack: StackEntry<C>[] = []
	const state = shallowRef(toHistoryState(undoStack, redoStack))

	function refresh(): void {
		state.value = toHistoryState(undoStack, redoStack)
	}

	function record(entry: CommandHistoryEntry<C>): void {
		const now = Date.now()
		const top = undoStack[undoStack.length - 1]
		redoStack.length = 0
		if (canMerge({ top, entry, now, window })) {
			undoStack[undoStack.length - 1] = { entry: mergeEntries((top as StackEntry<C>).entry, entry), time: now }
		} else {
			undoStack.push({ entry, time: now })
			trimStack(undoStack, limit)
		}
		refresh()
	}

	function step(direction: 'undo' | 'redo', apply: (changes: readonly C[], direction: 'undo' | 'redo') => void): boolean {
		const [from, to] = direction === 'undo' ? [undoStack, redoStack] : [redoStack, undoStack]
		const item = from.pop()
		if (!item) return false
		apply(item.entry[direction], direction)
		to.push(item)
		refresh()
		return true
	}

	function clear(): void {
		undoStack.length = 0
		redoStack.length = 0
		refresh()
	}

	return { record, step, clear, list: () => toHistoryList(undoStack, redoStack), state }
}

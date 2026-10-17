/** Утилиты: стеки истории команд — склейка шагов, предел глубины, список для «Истории изменений» */
import type { MergeCheck, StackEntry } from '../types/historyInternal.types'
import type { CommandHistoryEntry, CommandHistoryItem, CommandHistoryState } from '../types/useCommandHistory.types'

/** Склейка двух шагов с одним ключом: вперёд — по порядку, назад — сначала новые */
export function mergeEntries<C>(previous: CommandHistoryEntry<C>, next: CommandHistoryEntry<C>): CommandHistoryEntry<C> {
	return {
		label: next.label,
		redo: [...previous.redo, ...next.redo],
		undo: [...next.undo, ...previous.undo],
		mergeKey: previous.mergeKey,
	}
}

/** Один шаг из нескольких, записанных внутри `transact` */
export function combineEntries<C>(label: string, entries: readonly CommandHistoryEntry<C>[]): CommandHistoryEntry<C> {
	return {
		label,
		redo: entries.flatMap(item => item.redo),
		undo: [...entries].reverse().flatMap(item => item.undo),
	}
}

/** Можно ли склеить шаг с верхним шагом стека */
export function canMerge<C>({ top, entry, now, window }: MergeCheck<C>): boolean {
	return Boolean(top && entry.mergeKey && top.entry.mergeKey === entry.mergeKey && now - top.time <= window)
}

/** Обрезать стек по глубине: старые шаги уходят первыми */
export function trimStack<C>(stack: StackEntry<C>[], limit: number): void {
	if (stack.length > limit) stack.splice(0, stack.length - limit)
}

/** Состояние истории по стекам */
export function toHistoryState<C>(undoStack: readonly StackEntry<C>[], redoStack: readonly StackEntry<C>[]): CommandHistoryState {
	const undoTop = undoStack[undoStack.length - 1]
	const redoTop = redoStack[redoStack.length - 1]
	return {
		canUndo: undoStack.length > 0,
		canRedo: redoStack.length > 0,
		undoLabel: undoTop?.entry.label,
		redoLabel: redoTop?.entry.label,
	}
}

/** Список шагов: сделанные от старых к новым, затем отменённые в порядке повтора */
export function toHistoryList<C>(undoStack: readonly StackEntry<C>[], redoStack: readonly StackEntry<C>[]): CommandHistoryItem[] {
	const done = undoStack.map(item => ({ label: item.entry.label, time: item.time, isUndone: false }))
	const undone = [...redoStack].reverse().map(item => ({ label: item.entry.label, time: item.time, isUndone: true }))
	return [...done, ...undone]
}

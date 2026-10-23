import { computed, shallowRef } from 'vue'

function last(stack: string[]): string | undefined {
	return stack[stack.length - 1]
}

export function useImageMapHistory(getLimit: () => number) {
	const undoStack = shallowRef<string[]>([])
	const redoStack = shallowRef<string[]>([])
	let pending: string | undefined
	let lastKey: string | undefined

	function push(stack: string[], snapshot: string): string[] {
		return [...stack, snapshot].slice(-Math.max(1, getLimit()))
	}

	return {
		canUndo: computed(() => undoStack.value.length > 0),
		canRedo: computed(() => redoStack.value.length > 0),
		begin(snapshot: string): void {
			pending = snapshot
		},
		commit(current: string, mergeKey?: string): boolean {
			const before = pending
			pending = undefined
			if (before === undefined || before === current) return false
			if (!mergeKey || mergeKey !== lastKey) undoStack.value = push(undoStack.value, before)
			lastKey = mergeKey
			redoStack.value = []
			return true
		},
		undo(current: string): string | undefined {
			const previous = last(undoStack.value)
			if (previous === undefined) return undefined
			undoStack.value = undoStack.value.slice(0, -1)
			redoStack.value = push(redoStack.value, current)
			lastKey = undefined
			return previous
		},
		redo(current: string): string | undefined {
			const next = last(redoStack.value)
			if (next === undefined) return undefined
			redoStack.value = redoStack.value.slice(0, -1)
			undoStack.value = push(undoStack.value, current)
			lastKey = undefined
			return next
		},
		clear(): void {
			undoStack.value = []
			redoStack.value = []
			pending = undefined
			lastKey = undefined
		},
	}
}

import type { TextDiffChange } from '../../types/BaseTextDiff.types'

const TABLE_LIMIT = 4_000_000

function commonPrefix<T>(before: readonly T[], after: readonly T[]): number {
	let size = 0
	while (size < before.length && size < after.length && before[size] === after[size]) size++
	return size
}

function commonSuffix<T>(before: readonly T[], after: readonly T[], prefix: number): number {
	let size = 0
	const limit = Math.min(before.length, after.length) - prefix
	while (size < limit && before[before.length - 1 - size] === after[after.length - 1 - size]) size++
	return size
}

function lcsTable<T>(before: readonly T[], after: readonly T[]): Uint32Array {
	const width = after.length + 1
	const table = new Uint32Array((before.length + 1) * width)
	for (let row = before.length - 1; row >= 0; row--) {
		for (let column = after.length - 1; column >= 0; column--) {
			const cell = row * width + column
			table[cell] = before[row] === after[column] ? table[cell + width + 1] + 1 : Math.max(table[cell + width], table[cell + 1])
		}
	}
	return table
}

function nextChange<T>(
	before: readonly T[],
	after: readonly T[],
	state: { table: Uint32Array; width: number; row: number; column: number },
): TextDiffChange {
	if (state.row === before.length) return 'added'
	if (state.column === after.length) return 'removed'
	if (before[state.row] === after[state.column]) return 'equal'
	const cell = state.row * state.width + state.column
	return state.table[cell + state.width] >= state.table[cell + 1] ? 'removed' : 'added'
}

function middleChanges<T>(before: readonly T[], after: readonly T[]): TextDiffChange[] {
	if (before.length * after.length > TABLE_LIMIT) return [...before.map(() => 'removed' as const), ...after.map(() => 'added' as const)]
	const state = { table: lcsTable(before, after), width: after.length + 1, row: 0, column: 0 }
	const changes: TextDiffChange[] = []
	while (state.row < before.length || state.column < after.length) {
		const change = nextChange(before, after, state)
		changes.push(change)
		if (change !== 'added') state.row++
		if (change !== 'removed') state.column++
	}
	return changes
}

export function diffSequence<T>(before: readonly T[], after: readonly T[]): TextDiffChange[] {
	const prefix = commonPrefix(before, after)
	const suffix = commonSuffix(before, after, prefix)
	const middle = middleChanges(before.slice(prefix, before.length - suffix), after.slice(prefix, after.length - suffix))
	return [...Array<TextDiffChange>(prefix).fill('equal'), ...middle, ...Array<TextDiffChange>(suffix).fill('equal')]
}

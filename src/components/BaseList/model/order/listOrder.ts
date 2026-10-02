import type { ListItem } from '../../types/BaseList.types'

const insertAt = <T>(items: readonly T[], item: T, position: number): T[] => [...items.slice(0, position), item, ...items.slice(position)]

export const indexOfId = (items: readonly ListItem[], id: string): number => items.findIndex(item => item.id === id)

export function moveToIndex<T extends ListItem>(items: readonly T[], id: string, index: number): T[] {
	const item = items.find(entry => entry.id === id)
	if (!item) return [...items]
	const rest = items.filter(entry => entry !== item)
	return insertAt(rest, item, Math.max(0, Math.min(index, rest.length)))
}

function neighborPosition(rest: readonly ListItem[], neighbors: { after?: ListItem; before?: ListItem }): number {
	if (neighbors.after) return indexOfId(rest, neighbors.after.id)
	if (neighbors.before) return indexOfId(rest, neighbors.before.id) + 1
	return rest.length
}

export function mergeShown<T extends ListItem>(full: readonly T[], shown: readonly T[], id: string): T[] {
	const moved = full.find(item => item.id === id) as T
	const rest = full.filter(item => item.id !== id)
	const index = indexOfId(shown, id)
	return insertAt(rest, moved, neighborPosition(rest, { after: shown[index + 1], before: shown[index - 1] }))
}

const STEP_TARGETS: Record<string, (index: number, size: number) => number> = {
	ArrowUp: index => index - 1,
	ArrowDown: index => index + 1,
	Home: () => 0,
	End: (_, size) => size - 1,
}

export function stepIndex(items: readonly ListItem[], id: string, key: string): number | null {
	const index = indexOfId(items, id)
	const target = STEP_TARGETS[key]?.(index, items.length)
	if (target === undefined || target === index || target < 0 || target >= items.length) return null
	return target
}

const restIndex = (row: HTMLElement, draggedIndex: number): number => {
	const index = Number(row.dataset.listIndex)
	return index > draggedIndex ? index - 1 : index
}

export function dropIndex(root: HTMLElement | null, point: { y: number }, dragged: { id: string; index: number }): number | null {
	const rows = [...(root?.querySelectorAll<HTMLElement>('[data-list-id]') ?? [])].filter(row => row.dataset.listId !== dragged.id)
	if (!rows.length) return null
	const target = rows.find(row => {
		const rect = row.getBoundingClientRect()
		return point.y < rect.top + rect.height / 2
	})
	if (target) return restIndex(target, dragged.index)
	return restIndex(rows[rows.length - 1], dragged.index) + 1
}

export const rowElement = (root: HTMLElement | null, id: string): HTMLElement | null =>
	[...(root?.querySelectorAll<HTMLElement>('[data-list-id]') ?? [])].find(row => row.dataset.listId === id) ?? null

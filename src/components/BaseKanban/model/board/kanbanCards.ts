import type { KanbanCard, KanbanColumn, KanbanPlace } from '../../types/BaseKanban.types'

const COLUMN_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }

export const columnCards = (cards: readonly KanbanCard[], columnId: string): KanbanCard[] =>
	cards.filter(card => card.columnId === columnId)

export function locateCard(cards: readonly KanbanCard[], cardId: string): KanbanPlace | null {
	const card = cards.find(item => item.id === cardId)
	if (!card) return null
	return { columnId: card.columnId, index: columnCards(cards, card.columnId).indexOf(card) }
}

function insertPosition(rest: readonly KanbanCard[], target: KanbanPlace): number {
	const siblings = columnCards(rest, target.columnId)
	const before = siblings[target.index]
	if (before) return rest.indexOf(before)
	const last = siblings[siblings.length - 1]
	return last ? rest.indexOf(last) + 1 : rest.length
}

function neighborPosition(rest: readonly KanbanCard[], neighbors: { after?: KanbanCard; before?: KanbanCard }): number | null {
	const indexOf = (card: KanbanCard): number => rest.findIndex(item => item.id === card.id)
	if (neighbors.after) return indexOf(neighbors.after)
	return neighbors.before ? indexOf(neighbors.before) + 1 : null
}

const insertAt = (cards: readonly KanbanCard[], card: KanbanCard, position: number): KanbanCard[] => [
	...cards.slice(0, position),
	card,
	...cards.slice(position),
]

export const appendCard = (cards: readonly KanbanCard[], card: KanbanCard): KanbanCard[] =>
	insertAt(cards, card, insertPosition(cards, { columnId: card.columnId, index: cards.length }))

export function mergeDisplayed(full: readonly KanbanCard[], displayed: readonly KanbanCard[], cardId: string): KanbanCard[] {
	const moved = displayed.find(card => card.id === cardId) as KanbanCard
	const rest = full.filter(card => card.id !== cardId)
	const siblings = columnCards(displayed, moved.columnId)
	const index = siblings.indexOf(moved)
	const position = neighborPosition(rest, { after: siblings[index + 1], before: siblings[index - 1] })
	return position === null ? appendCard(rest, moved) : insertAt(rest, moved, position)
}

export function moveCard(cards: readonly KanbanCard[], cardId: string, target: KanbanPlace): KanbanCard[] {
	const card = cards.find(item => item.id === cardId)
	if (!card) return [...cards]
	const rest = cards.filter(item => item !== card)
	return insertAt(rest, { ...card, columnId: target.columnId }, insertPosition(rest, target))
}

export function neighborCard(cards: readonly KanbanCard[], cardId: string): KanbanCard | undefined {
	const place = locateCard(cards, cardId) as KanbanPlace
	const own = columnCards(cards, place.columnId)
	return own[place.index + 1] ?? own[place.index - 1]
}

export const isSamePlace = (a: KanbanPlace | null, b: KanbanPlace | null): boolean => a?.columnId === b?.columnId && a?.index === b?.index

export function resolveMove(full: readonly KanbanCard[], shown: readonly KanbanCard[], move: { cardId: string; origin: KanbanPlace }) {
	const card = full.find(item => item.id === move.cardId) as KanbanCard
	const from = locateCard(full, move.cardId) as KanbanPlace
	if (isSamePlace(move.origin, locateCard(shown, move.cardId))) return { next: null, move: { card, from, to: from } }
	const next = mergeDisplayed(full, shown, move.cardId)
	return { next, move: { card, from, to: locateCard(next, move.cardId) as KanbanPlace } }
}

function neighborColumn(columns: readonly KanbanColumn[], columnId: string, step: number): KanbanColumn | null {
	return columns[columns.findIndex(column => column.id === columnId) + step] ?? null
}

function nearestFilledColumn(cards: readonly KanbanCard[], columns: readonly KanbanColumn[], from: { columnId: string; step: number }) {
	let column = neighborColumn(columns, from.columnId, from.step)
	while (column && columnCards(cards, column.id).length === 0) column = neighborColumn(columns, column.id, from.step)
	return column
}

export function focusTarget(
	cards: readonly KanbanCard[],
	columns: readonly KanbanColumn[],
	move: { cardId: string; key: string },
): KanbanCard | null {
	const place = locateCard(cards, move.cardId) as KanbanPlace
	const own = columnCards(cards, place.columnId)
	const vertical: Record<string, number> = { ArrowUp: place.index - 1, ArrowDown: place.index + 1, Home: 0, End: own.length - 1 }
	if (move.key in vertical) return own[vertical[move.key]] ?? null
	const column = nearestFilledColumn(cards, columns, { columnId: place.columnId, step: COLUMN_STEPS[move.key] })
	if (!column) return null
	const target = columnCards(cards, column.id)
	return target[Math.min(place.index, target.length - 1)]
}

export function stepPlace(
	cards: readonly KanbanCard[],
	columns: readonly KanbanColumn[],
	move: { cardId: string; key: string },
): KanbanPlace | null {
	const place = locateCard(cards, move.cardId) as KanbanPlace
	const size = columnCards(cards, place.columnId).length
	if (move.key === 'ArrowUp') return place.index > 0 ? { ...place, index: place.index - 1 } : null
	if (move.key === 'ArrowDown') return place.index < size - 1 ? { ...place, index: place.index + 1 } : null
	const column = move.key in COLUMN_STEPS ? neighborColumn(columns, place.columnId, COLUMN_STEPS[move.key]) : null
	if (!column) return null
	return { columnId: column.id, index: Math.min(place.index, columnCards(cards, column.id).length) }
}

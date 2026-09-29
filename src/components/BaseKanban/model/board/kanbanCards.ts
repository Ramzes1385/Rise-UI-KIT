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

export function moveCard(cards: readonly KanbanCard[], cardId: string, target: KanbanPlace): KanbanCard[] {
	const card = cards.find(item => item.id === cardId)
	if (!card) return [...cards]
	const rest = cards.filter(item => item !== card)
	const position = insertPosition(rest, target)
	return [...rest.slice(0, position), { ...card, columnId: target.columnId }, ...rest.slice(position)]
}

export const isSamePlace = (a: KanbanPlace | null, b: KanbanPlace | null): boolean => a?.columnId === b?.columnId && a?.index === b?.index

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

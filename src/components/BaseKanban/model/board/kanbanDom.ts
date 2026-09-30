import type { KanbanPlace } from '../../types/BaseKanban.types'

const DATA_SELECTORS = { cardId: '[data-card-id]', columnId: '[data-column-id]' }

function dataElement(root: HTMLElement | null, key: keyof typeof DATA_SELECTORS, id: string): HTMLElement | null {
	const elements = root ? [...root.querySelectorAll<HTMLElement>(DATA_SELECTORS[key])] : []
	return elements.find(element => element.dataset[key] === id) ?? null
}

export const cardElement = (root: HTMLElement | null, cardId: string): HTMLElement | null => dataElement(root, 'cardId', cardId)

export const columnPart = (root: HTMLElement | null, columnId: string, selector: string): HTMLElement | null =>
	dataElement(root, 'columnId', columnId)?.querySelector<HTMLElement>(selector) ?? null

const isInside = (element: HTMLElement, x: number): boolean => {
	const rect = element.getBoundingClientRect()
	return x >= rect.left && x <= rect.right
}

export function dropPlace(root: HTMLElement, point: { x: number; y: number }, cardId: string): KanbanPlace | null {
	const column = [...root.querySelectorAll<HTMLElement>('[data-column-id]')].find(element => isInside(element, point.x))
	if (!column) return null
	const cards = [...column.querySelectorAll<HTMLElement>('[data-card-id]')].filter(element => element.dataset.cardId !== cardId)
	const index = cards.findIndex(element => {
		const rect = element.getBoundingClientRect()
		return point.y < rect.top + rect.height / 2
	})
	return { columnId: column.dataset.columnId as string, index: index < 0 ? cards.length : index }
}

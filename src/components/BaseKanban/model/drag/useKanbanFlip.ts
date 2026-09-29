import { watch } from 'vue'
import type { KanbanBoardContext } from '../../types/BaseKanban.types'

const DURATION = 220

const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

export const isMotionReduced = (): boolean => typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches

function measure(root: HTMLElement | null, selector: string, key: string): Map<string, DOMRect> {
	const rects = new Map<string, DOMRect>()
	for (const element of root?.querySelectorAll<HTMLElement>(selector) ?? [])
		rects.set(element.dataset[key] as string, element.getBoundingClientRect())
	return rects
}

function playCards(root: HTMLElement | null, before: Map<string, DOMRect>): void {
	for (const element of root?.querySelectorAll<HTMLElement>('[data-card-id]') ?? []) {
		const old = before.get(element.dataset.cardId as string)
		const now = element.getBoundingClientRect()
		if (!old || (old.left === now.left && old.top === now.top)) continue
		const transform = `translate(${old.left - now.left}px, ${old.top - now.top}px)`
		element.animate?.([{ transform }, { transform: 'none' }], { duration: DURATION, easing: EASING })
	}
}

function playColumns(root: HTMLElement | null, before: Map<string, DOMRect>): void {
	for (const element of root?.querySelectorAll<HTMLElement>('[data-column-id]') ?? []) {
		const old = before.get(element.dataset.columnId as string)
		const now = element.getBoundingClientRect()
		if (!old || old.height === now.height) continue
		element.animate?.([{ height: `${old.height}px` }, { height: `${now.height}px` }], { duration: DURATION, easing: EASING })
	}
}

export function useKanbanFlip(context: KanbanBoardContext): void {
	let cards = new Map<string, DOMRect>()
	let columns = new Map<string, DOMRect>()
	watch(
		context.cards,
		() => {
			cards = measure(context.rootRef.value, '[data-card-id]', 'cardId')
			columns = measure(context.rootRef.value, '[data-column-id]', 'columnId')
		},
		{ flush: 'pre' },
	)
	watch(
		context.cards,
		() => {
			if (isMotionReduced()) return
			playCards(context.rootRef.value, cards)
			playColumns(context.rootRef.value, columns)
		},
		{ flush: 'post' },
	)
}

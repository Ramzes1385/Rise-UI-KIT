import { computed, watch } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { KanbanBoardContext } from '../../types/BaseKanban.types'

const CARD_SELECTOR = '[data-card-id]'

const MOVED_CLASS = 'base-kanban__item--moved'

const cardElements = (root: HTMLElement | null): HTMLElement[] => [...(root?.querySelectorAll<HTMLElement>(CARD_SELECTOR) ?? [])]

const itemCardId = (item: Element): string | undefined => item.querySelector<HTMLElement>(CARD_SELECTOR)?.dataset.cardId

function measure(root: HTMLElement | null): Map<string, DOMRect> {
	return new Map(cardElements(root).map(element => [element.dataset.cardId as string, element.getBoundingClientRect()]))
}

function holdLeavingItem(element: Element): void {
	const item = element as HTMLElement
	item.style.top = `${item.offsetTop}px`
	item.style.left = `${item.offsetLeft}px`
	item.style.width = `${item.offsetWidth}px`
	item.setAttribute('aria-hidden', 'true')
	item.setAttribute('inert', '')
	for (const card of item.querySelectorAll(CARD_SELECTOR)) card.removeAttribute('data-card-id')
	for (const node of item.querySelectorAll('[id]')) node.removeAttribute('id')
}

function useKanbanFlip(context: KanbanBoardContext): void {
	const motion = useMotion(() => context.rootRef.value)
	let before = new Map<string, DOMRect>()
	const source = (): unknown => context.cards.value
	watch(
		source,
		() => {
			before = measure(context.rootRef.value)
		},
		{ flush: 'pre' },
	)
	watch(
		source,
		() => {
			if (motion.isReduced.value) return
			const timing = { duration: motion.duration('base'), easing: motion.easing('emphasized') }
			for (const element of cardElements(context.rootRef.value)) {
				const old = before.get(element.dataset.cardId as string)
				const now = element.getBoundingClientRect()
				if (!old || (old.left === now.left && old.top === now.top)) continue
				element.animate?.(
					[{ transform: `translate(${old.left - now.left}px, ${old.top - now.top}px)` }, { transform: 'none' }],
					timing,
				)
			}
		},
		{ flush: 'post' },
	)
}

function useKanbanItemTransition(context: KanbanBoardContext) {
	const shown = computed(() => {
		const collapsed = context.collapsed.value
		return new Set(context.cards.value.filter(card => !collapsed.includes(card.columnId)).map(card => card.id))
	})
	let rendered = new Set<string>()
	watch(
		shown,
		ids => {
			rendered = ids
		},
		{ flush: 'post', immediate: true },
	)
	return {
		handleItemBeforeEnter(element: Element): void {
			if (rendered.has(itemCardId(element) as string)) element.classList.add(MOVED_CLASS)
		},
		handleItemAfterEnter(element: Element): void {
			element.classList.remove(MOVED_CLASS)
		},
		handleItemBeforeLeave(element: Element): void {
			if (shown.value.has(itemCardId(element) as string)) element.classList.add(MOVED_CLASS)
			holdLeavingItem(element)
		},
	}
}

export function useKanbanMotion(context: KanbanBoardContext) {
	useKanbanFlip(context)
	return useKanbanItemTransition(context)
}

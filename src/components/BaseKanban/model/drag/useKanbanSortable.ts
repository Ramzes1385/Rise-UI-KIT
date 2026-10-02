import { computed, nextTick, ref } from 'vue'
import { cardElement, dropPlace } from '../board/kanbanDom'
import { useSortable } from '@composables/interaction/useSortable'
import type { KanbanBoardContext, KanbanCard, KanbanPlace } from '../../types/BaseKanban.types'
import { columnCards, focusTarget, isSamePlace, locateCard, moveCard, stepPlace } from '../board/kanbanCards'

const IDLE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', ' ', 'Enter'])

const FLIP = {
	items: { selector: '[data-card-id]', key: 'cardId' },
	containers: { selector: '[data-column-id]', key: 'columnId' },
}

function useKanbanFocus(context: KanbanBoardContext) {
	const activeId = ref<string | null>(null)
	return {
		focusCard(cardId: string): void {
			activeId.value = cardId
			nextTick(() => cardElement(context.rootRef.value, cardId)?.focus())
		},
		handleCardFocus(card: KanbanCard): void {
			activeId.value = card.id
		},
		activeId: computed(() => {
			const reachable = context.columns.value.flatMap(column => columnCards(context.cards.value, column.id))
			return reachable.find(card => card.id === activeId.value)?.id ?? reachable[0]?.id
		}),
	}
}

function kanbanSortable(context: KanbanBoardContext, focusCard: (cardId: string) => void) {
	return useSortable<KanbanCard, KanbanPlace>({
		rootRef: context.rootRef,
		itemId: card => card.id,
		isDisabled: () => Boolean(context.props.isDisabled),
		locate: cardId => locateCard(context.cards.value, cardId),
		isSamePlace,
		stepPlace: (cardId, key) => stepPlace(context.cards.value, context.columns.value, { cardId, key }),
		dropPlace: (point, cardId) => dropPlace(context.rootRef.value as HTMLElement, point, cardId),
		itemElement: cardId => cardElement(context.rootRef.value, cardId),
		onStart: () => {
			context.draft.value = [...context.cards.value]
		},
		onPreview: (cardId, place) => {
			context.draft.value = moveCard(context.cards.value, cardId, place)
		},
		onDrop: (move, done) => context.finish({ cardId: move.id, origin: move.origin }, done),
		onCancel: (cardId, done) => context.cancel(cardId, done),
		onAnnounce: (message, cardId) => context.announce(message, cardId),
		focusItem: focusCard,
		settlingClass: 'base-kanban__ghost--settling',
		flip: { source: () => context.cards.value, ...FLIP },
	})
}

export function useKanbanSortable(context: KanbanBoardContext) {
	const focus = useKanbanFocus(context)
	const sortable = kanbanSortable(context, focus.focusCard)
	const handleIdle = (event: KeyboardEvent, card: KanbanCard): void => {
		const isAction = event.key === ' ' || event.key === 'Enter'
		const target = isAction ? null : focusTarget(context.cards.value, context.columns.value, { cardId: card.id, key: event.key })
		if (event.key === ' ') sortable.grab(card)
		else if (event.key === 'Enter' && !context.props.isDisabled) context.emit('open', card)
		if (target) focus.focusCard(target.id)
	}
	return {
		...sortable,
		activeId: focus.activeId,
		handleCardFocus: focus.handleCardFocus,
		isPlaceholder: (card: KanbanCard): boolean => sortable.drag.value?.item.id === card.id,
		handleCardKeydown(event: KeyboardEvent, card: KanbanCard): void {
			if (event.isComposing || sortable.handleGrabbedKeydown(event) || !IDLE_KEYS.has(event.key)) return
			event.preventDefault()
			handleIdle(event, card)
		},
		handleCardClick(card: KanbanCard): void {
			if (!sortable.consumeClick() && !context.props.isDisabled) context.emit('open', card)
		},
	}
}

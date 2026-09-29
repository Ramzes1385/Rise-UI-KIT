import { cardElement } from '../board/kanbanDom'
import { computed, nextTick, ref, shallowRef } from 'vue'
import { focusTarget, locateCard, moveCard, stepPlace } from '../board/kanbanCards'
import type { KanbanBoardContext, KanbanCard, KanbanPlace } from '../../types/BaseKanban.types'

const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])

const ACTION_KEYS = new Set([' ', 'Enter', 'Escape'])

function useKanbanGrab(context: KanbanBoardContext, focusCard: (cardId: string) => void) {
	const grabbed = shallowRef<{ cardId: string; origin: KanbanPlace } | null>(null)
	const drop = (): void => {
		grabbed.value = null
	}
	const release = (cardId: string): void => {
		drop()
		focusCard(cardId)
	}
	const step = (key: string, cardId: string): void => {
		const place = stepPlace(context.cards.value, context.props.columns, { cardId, key })
		if (!place) return
		context.draft.value = moveCard(context.cards.value, cardId, place)
		context.announce('MOVED', cardId)
		focusCard(cardId)
	}
	return {
		grabbed,
		grab(card: KanbanCard): void {
			grabbed.value = { cardId: card.id, origin: locateCard(context.cards.value, card.id) as KanbanPlace }
			context.draft.value = [...context.cards.value]
			context.announce('PICKED', card.id)
		},
		handleGrabbed(event: KeyboardEvent, current: { cardId: string; origin: KanbanPlace }): void {
			if (event.key === 'Tab') context.cancel(current.cardId, drop)
			if (!MOVE_KEYS.has(event.key) && !ACTION_KEYS.has(event.key)) return
			event.preventDefault()
			if (event.key === 'Escape') context.cancel(current.cardId, () => release(current.cardId))
			else if (event.key === ' ' || event.key === 'Enter') context.finish(current, () => release(current.cardId))
			else step(event.key, current.cardId)
		},
	}
}

export function useKanbanKeyboard(context: KanbanBoardContext) {
	const activeId = ref<string | null>(null)
	const focusCard = (cardId: string): void => {
		activeId.value = cardId
		nextTick(() => cardElement(context.rootRef.value, cardId)?.focus())
	}
	const { grabbed, grab, handleGrabbed } = useKanbanGrab(context, focusCard)
	const handleIdle = (event: KeyboardEvent, card: KanbanCard): void => {
		const isAction = event.key === ' ' || event.key === 'Enter'
		if (!MOVE_KEYS.has(event.key) && !isAction) return
		event.preventDefault()
		if (event.key === ' ' && !context.props.isDisabled) grab(card)
		else if (event.key === 'Enter' && !context.props.isDisabled) context.emit('open', card)
		const target = isAction ? null : focusTarget(context.cards.value, context.props.columns, { cardId: card.id, key: event.key })
		if (target) focusCard(target.id)
	}
	return {
		grabbedId: computed(() => grabbed.value?.cardId ?? null),
		activeId: computed(() => context.cards.value.find(card => card.id === activeId.value)?.id ?? context.cards.value[0]?.id),
		handleCardFocus(card: KanbanCard): void {
			activeId.value = card.id
		},
		handleCardKeydown(event: KeyboardEvent, card: KanbanCard): void {
			if (event.isComposing) return
			if (grabbed.value) handleGrabbed(event, grabbed.value)
			else handleIdle(event, card)
		},
	}
}

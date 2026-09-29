import { dropPlace } from '../board/kanbanDom'
import { onBeforeUnmount, shallowRef } from 'vue'
import { isSamePlace, locateCard, moveCard } from '../board/kanbanCards'
import type { KanbanBoardContext, KanbanCard, KanbanPlace, KanbanPointerDrag } from '../../types/BaseKanban.types'

const DRAG_THRESHOLD = 5

function createPointerSession(context: KanbanBoardContext, press: { card: KanbanCard; x: number; y: number; element: HTMLElement }) {
	const drag = shallowRef<KanbanPointerDrag | null>(null)
	let origin: KanbanPlace | null = null
	const start = (): void => {
		const rect = press.element.getBoundingClientRect()
		origin = locateCard(context.cards.value, press.card.id)
		drag.value = {
			card: press.card,
			x: press.x,
			y: press.y,
			offsetX: press.x - rect.left,
			offsetY: press.y - rect.top,
			width: rect.width,
		}
		context.draft.value = [...context.cards.value]
	}
	return {
		drag,
		move(event: PointerEvent): void {
			if (!drag.value && Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD) return
			if (!drag.value) start()
			drag.value = { ...(drag.value as KanbanPointerDrag), x: event.clientX, y: event.clientY }
			const place = dropPlace(context.rootRef.value as HTMLElement, { x: event.clientX, y: event.clientY }, press.card.id)
			if (place && !isSamePlace(place, locateCard(context.cards.value, press.card.id)))
				context.draft.value = moveCard(context.cards.value, press.card.id, place)
		},
		end: () => ({ cardId: press.card.id, origin: origin as KanbanPlace }),
	}
}

export function useKanbanPointer(context: KanbanBoardContext) {
	const drag = shallowRef<KanbanPointerDrag | null>(null)
	let session: ReturnType<typeof createPointerSession> | null = null
	let isClickSuppressed = false
	const stop = (): void => {
		window.removeEventListener('pointermove', handleMove)
		window.removeEventListener('pointerup', handleUp)
		window.removeEventListener('keydown', handleKey)
		session = null
		drag.value = null
	}
	function handleMove(event: PointerEvent): void {
		session?.move(event)
		drag.value = session?.drag.value ?? null
	}
	function handleUp(): void {
		isClickSuppressed = Boolean(drag.value)
		if (drag.value && session) context.finish(session.end(), stop)
		else stop()
	}
	function handleKey(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !drag.value) return
		event.preventDefault()
		context.cancel(drag.value.card.id, stop)
	}
	onBeforeUnmount(stop)
	return {
		drag,
		handlePointerDown(event: PointerEvent, card: KanbanCard): void {
			if (context.props.isDisabled || event.button !== 0 || event.pointerType === 'touch') return
			session = createPointerSession(context, {
				card,
				x: event.clientX,
				y: event.clientY,
				element: event.currentTarget as HTMLElement,
			})
			window.addEventListener('pointermove', handleMove)
			window.addEventListener('pointerup', handleUp)
			window.addEventListener('keydown', handleKey)
		},
		handleCardClick(card: KanbanCard): void {
			const isSuppressed = isClickSuppressed
			isClickSuppressed = false
			if (!isSuppressed && !context.props.isDisabled) context.emit('open', card)
		},
	}
}

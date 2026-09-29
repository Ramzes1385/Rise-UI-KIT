import { isMotionReduced } from './useKanbanFlip'
import { dropPlace, cardElement } from '../board/kanbanDom'
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import { isSamePlace, locateCard, moveCard } from '../board/kanbanCards'
import type { KanbanBoardContext, KanbanCard, KanbanPlace, KanbanPointerDrag } from '../../types/BaseKanban.types'

const DRAG_THRESHOLD = 5

const SETTLE_DURATION = 180

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

function settleGhost(context: KanbanBoardContext, ghost: { value: HTMLElement | null }, card: { id: string; done: () => void }): void {
	nextTick(() => {
		const target = cardElement(context.rootRef.value, card.id)?.getBoundingClientRect()
		if (!ghost.value?.animate || !target || isMotionReduced()) return card.done()
		ghost.value.classList.add('base-kanban__ghost--settling')
		const animation = ghost.value.animate([{ transform: `translate(${target.left}px, ${target.top}px)` }], {
			duration: SETTLE_DURATION,
			easing: 'ease-out',
			fill: 'forwards',
		})
		animation.onfinish = card.done
	})
}

function createClickGuard(context: KanbanBoardContext) {
	let isSuppressed = false
	return {
		suppress(value: boolean): void {
			isSuppressed = value
		},
		handleCardClick(card: KanbanCard): void {
			const wasSuppressed = isSuppressed
			isSuppressed = false
			if (!wasSuppressed && !context.props.isDisabled) context.emit('open', card)
		},
	}
}

function windowListeners(handlers: { move: (event: PointerEvent) => void; up: () => void; key: (event: KeyboardEvent) => void }) {
	return {
		listen(): void {
			window.addEventListener('pointermove', handlers.move)
			window.addEventListener('pointerup', handlers.up)
			window.addEventListener('keydown', handlers.key)
		},
		unlisten(): void {
			window.removeEventListener('pointermove', handlers.move)
			window.removeEventListener('pointerup', handlers.up)
			window.removeEventListener('keydown', handlers.key)
		},
	}
}

export function useKanbanPointer(context: KanbanBoardContext) {
	const drag = shallowRef<KanbanPointerDrag | null>(null)
	const ghostRef = ref<HTMLElement | null>(null)
	let session: ReturnType<typeof createPointerSession> | null = null
	const clickGuard = createClickGuard(context)
	const listeners = windowListeners({ move: handleMove, up: handleUp, key: handleKey })
	const stop = (): void => {
		listeners.unlisten()
		session = null
		drag.value = null
	}
	const settle = (cardId: string) => (): void => {
		listeners.unlisten()
		settleGhost(context, ghostRef, { id: cardId, done: stop })
	}
	function handleMove(event: PointerEvent): void {
		session?.move(event)
		drag.value = session?.drag.value ?? null
	}
	function handleUp(): void {
		clickGuard.suppress(Boolean(drag.value))
		if (!drag.value || !session) return stop()
		const end = session.end()
		context.finish(end, settle(end.cardId))
	}
	function handleKey(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !drag.value) return
		event.preventDefault()
		context.cancel(drag.value.card.id, settle(drag.value.card.id))
	}
	onBeforeUnmount(stop)
	return {
		drag,
		ghostRef,
		handlePointerDown(event: PointerEvent, card: KanbanCard): void {
			if (context.props.isDisabled || event.button !== 0 || event.pointerType === 'touch' || drag.value) return
			session = createPointerSession(context, {
				card,
				x: event.clientX,
				y: event.clientY,
				element: event.currentTarget as HTMLElement,
			})
			listeners.listen()
		},
		handleCardClick: clickGuard.handleCardClick,
	}
}

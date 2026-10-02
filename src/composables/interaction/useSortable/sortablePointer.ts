/** Composable: перетаскивание мышью — порог сдвига, «призрак» под курсором, посадка на место, Escape отменяет */
import { isMotionReduced } from './sortableFlip'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import type { SortableDrag, SortableMove, SortablePress, SortableWindowHandlers, UseSortableOptions } from './types/useSortable.types'

const DRAG_THRESHOLD = 5

const SETTLE_DURATION = 180

/** Одно нажатие: до порога — ничего, после — «призрак» и предварительный перенос под курсором */
function createPointerSession<TItem, TPlace>(options: UseSortableOptions<TItem, TPlace>, press: SortablePress<TItem>) {
	const drag = shallowRef<SortableDrag<TItem> | null>(null)
	const id = options.itemId(press.item)
	let origin: TPlace | null = null
	const start = (): void => {
		const rect = press.element.getBoundingClientRect()
		origin = options.locate(id)
		drag.value = {
			item: press.item,
			x: press.x,
			y: press.y,
			offsetX: press.x - rect.left,
			offsetY: press.y - rect.top,
			width: rect.width,
		}
		options.onStart(id, 'pointer')
	}
	return {
		drag,
		move(event: PointerEvent): void {
			if (!drag.value && Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD) return
			if (!drag.value) start()
			drag.value = { ...(drag.value as SortableDrag<TItem>), x: event.clientX, y: event.clientY }
			const place = options.dropPlace({ x: event.clientX, y: event.clientY }, id)
			if (place && !options.isSamePlace(place, options.locate(id))) options.onPreview(id, place)
		},
		end: (): SortableMove<TPlace> => ({ id, origin: origin as TPlace }),
	}
}

/** Плавная посадка «призрака» на новое место элемента; без анимации — сразу `done` */
function settleGhost(ghost: Ref<HTMLElement | null>, target: { element: HTMLElement | null; className?: string }, done: () => void): void {
	const rect = target.element?.getBoundingClientRect()
	if (!ghost.value?.animate || !rect || isMotionReduced()) return done()
	if (target.className) ghost.value.classList.add(target.className)
	const animation = ghost.value.animate([{ transform: `translate(${rect.left}px, ${rect.top}px)` }], {
		duration: SETTLE_DURATION,
		easing: 'ease-out',
		fill: 'forwards',
	})
	animation.onfinish = done
}

function windowListeners(handlers: SortableWindowHandlers) {
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

function createClickGuard() {
	let isSuppressed = false
	return {
		suppress(value: boolean): void {
			isSuppressed = value
		},
		consumeClick(): boolean {
			const wasSuppressed = isSuppressed
			isSuppressed = false
			return wasSuppressed
		},
	}
}

/** Стиль «призрака»: ширина элемента и положение под курсором с учётом точки захвата */
function ghostStyle<TItem>(drag: SortableDrag<TItem> | null): Record<string, string> {
	if (!drag) return {}
	return { width: `${drag.width}px`, transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)` }
}

/** Перетаскивание мышью и пером; касание не перехватывается — им прокручивают */
export function useSortablePointer<TItem, TPlace>(options: UseSortableOptions<TItem, TPlace>) {
	const drag = shallowRef<SortableDrag<TItem> | null>(null)
	const ghostRef = ref<HTMLElement | null>(null)
	let session: ReturnType<typeof createPointerSession<TItem, TPlace>> | null = null
	const clickGuard = createClickGuard()
	const listeners = windowListeners({ move: handleMove, up: handleUp, key: handleKey })
	const stop = (): void => {
		listeners.unlisten()
		session = null
		drag.value = null
	}
	const settle = (id: string) => (): void => {
		listeners.unlisten()
		nextTick(() => settleGhost(ghostRef, { element: options.itemElement(id), className: options.settlingClass }, stop))
	}
	function handleMove(event: PointerEvent): void {
		session?.move(event)
		drag.value = session?.drag.value ?? null
	}
	function handleUp(): void {
		clickGuard.suppress(Boolean(drag.value))
		if (!drag.value || !session) return stop()
		const end = session.end()
		options.onDrop(end, settle(end.id))
	}
	function handleKey(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !drag.value) return
		event.preventDefault()
		const id = options.itemId(drag.value.item)
		options.onCancel(id, settle(id))
	}
	onBeforeUnmount(stop)
	return {
		drag,
		ghostRef,
		consumeClick: clickGuard.consumeClick,
		ghostStyle: computed(() => ghostStyle(drag.value)),
		handlePointerDown(event: PointerEvent, item: TItem): void {
			if (options.isDisabled() || event.button !== 0 || event.pointerType === 'touch' || drag.value) return
			session = createPointerSession(options, {
				item,
				x: event.clientX,
				y: event.clientY,
				element: event.currentTarget as HTMLElement,
			})
			listeners.listen()
		},
	}
}

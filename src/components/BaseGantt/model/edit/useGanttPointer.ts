import { onBeforeUnmount } from 'vue'
import { pointerEdit } from './ganttEdit'
import type { GanttContext, GanttEdit, GanttItem, GanttPress, GanttPressHandlers } from '../../types/BaseGanttModel.types'

const DRAG_THRESHOLD = 3

function pressKind(target: EventTarget | null): GanttEdit['kind'] {
	const kind = (target as HTMLElement).dataset.ganttHandle
	return kind === 'resize-start' || kind === 'resize-end' ? kind : 'move'
}

function capturePointer(event: PointerEvent): void {
	const target = event.currentTarget as HTMLElement
	void (event.isTrusted && target.setPointerCapture?.(event.pointerId))
}

function listenToPress(handlers: GanttPressHandlers): () => void {
	window.addEventListener('pointermove', handlers.move)
	window.addEventListener('pointerup', handlers.up)
	window.addEventListener('pointercancel', handlers.cancel)
	window.addEventListener('keydown', handlers.escape)
	return () => {
		window.removeEventListener('pointermove', handlers.move)
		window.removeEventListener('pointerup', handlers.up)
		window.removeEventListener('pointercancel', handlers.cancel)
		window.removeEventListener('keydown', handlers.escape)
	}
}

export function useGanttPointer(context: GanttContext, commit: (item: GanttItem, edit: GanttEdit) => void) {
	let press: GanttPress | null = null
	let isClickSuppressed = false
	let unlisten: (() => void) | null = null

	function onPointerMove(event: PointerEvent): void {
		const current = press as GanttPress
		const deltaPx = event.clientX - current.x
		current.isMoved ||= Math.abs(deltaPx) >= DRAG_THRESHOLD
		if (!current.isMoved) return
		const edit = pointerEdit(current.item, { kind: current.kind, deltaPx, dayWidth: context.metrics.value.dayWidth })
		const span = context.draft.value?.edit.span
		if (span?.start.getTime() === edit.span.start.getTime() && span.end.getTime() === edit.span.end.getTime()) return
		context.draft.value = { id: current.item.id, edit }
	}

	function end(isSuppressed: boolean): void {
		isClickSuppressed = isSuppressed
		unlisten?.()
		unlisten = null
		press = null
		context.draft.value = null
	}

	const stop = (): void => end(Boolean(press?.isMoved))
	const cancel = (): void => end(false)

	function onPointerUp(): void {
		const current = press as GanttPress
		const edit = context.draft.value?.edit
		stop()
		if (edit) commit(current.item, edit)
	}

	function onEscape(event: KeyboardEvent): void {
		if (event.key === 'Escape') stop()
	}

	const handlers: GanttPressHandlers = { move: onPointerMove, up: onPointerUp, cancel, escape: onEscape }

	onBeforeUnmount(stop)

	return {
		onPointerDown(event: PointerEvent, item: GanttItem): void {
			if (!context.props.isEditable || context.props.isDisabled || event.button !== 0) return
			capturePointer(event)
			press = { item, kind: pressKind(event.target), x: event.clientX, isMoved: false }
			unlisten = listenToPress(handlers)
		},
		consumeSuppressedClick(): boolean {
			const wasSuppressed = isClickSuppressed
			isClickSuppressed = false
			return wasSuppressed
		},
	}
}

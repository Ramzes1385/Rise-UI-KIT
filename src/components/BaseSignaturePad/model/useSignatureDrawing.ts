import { onBeforeUnmount, shallowRef } from 'vue'
import { appendPoints, toViewBox } from './signature/signaturePath'
import type { SignaturePoint, SignatureStroke, SignatureDrawingOptions } from '../types/BaseSignaturePad.types'

export function useSignatureDrawing(options: SignatureDrawingOptions) {
	const current = shallowRef<SignatureStroke | null>(null)
	let pointerId: number | undefined
	const pointOf = (event: PointerEvent): SignaturePoint =>
		toViewBox(event, (options.surface() as Element).getBoundingClientRect(), options.size())

	function handleMove(event: PointerEvent): void {
		if (!current.value || event.pointerId !== pointerId) return
		const coalesced = event.getCoalescedEvents?.() ?? []
		current.value = appendPoints(current.value, (coalesced.length ? coalesced : [event]).map(pointOf))
	}

	function stop(): void {
		window.removeEventListener('pointermove', handleMove)
		window.removeEventListener('pointerup', finish)
		window.removeEventListener('pointercancel', finish)
	}

	function finish(event: PointerEvent): void {
		if (event.pointerId !== pointerId) return
		stop()
		const stroke = current.value as SignatureStroke
		current.value = null
		options.onStroke(stroke)
	}

	onBeforeUnmount(stop)

	return {
		current,
		handlePointerDown(event: PointerEvent): void {
			if (!options.isEnabled() || event.button !== 0 || current.value) return
			event.preventDefault()
			pointerId = event.pointerId
			current.value = [pointOf(event)]
			window.addEventListener('pointermove', handleMove)
			window.addEventListener('pointerup', finish)
			window.addEventListener('pointercancel', finish)
		},
	}
}

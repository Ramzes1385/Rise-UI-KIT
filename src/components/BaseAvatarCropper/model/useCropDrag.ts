import { onBeforeUnmount, ref } from 'vue'
import { panView } from './crop/cropGeometry'
import type { AvatarView } from '../types/BaseAvatarCropper.types'

export function useCropDrag(state: {
	start: () => { view: AvatarView; pixelsPerUnit: number } | null
	isEnabled: () => boolean
	setView: (view: AvatarView) => void
}) {
	const isDragging = ref(false)
	let origin = { x: 0, y: 0, view: { zoom: 1, centerX: 0, centerY: 0 }, pixelsPerUnit: 1 }

	function handleMove(event: PointerEvent): void {
		state.setView(panView(origin.view, { x: event.clientX - origin.x, y: event.clientY - origin.y }, origin.pixelsPerUnit))
	}

	function stop(): void {
		isDragging.value = false
		window.removeEventListener('pointermove', handleMove)
		window.removeEventListener('pointerup', stop)
		window.removeEventListener('pointercancel', stop)
	}

	onBeforeUnmount(stop)

	return {
		isDragging,
		handlePointerDown(event: PointerEvent): void {
			const start = state.start()
			if (!start || !state.isEnabled() || event.button !== 0) return
			event.preventDefault()
			origin = { x: event.clientX, y: event.clientY, ...start }
			isDragging.value = true
			window.addEventListener('pointermove', handleMove)
			window.addEventListener('pointerup', stop)
			window.addEventListener('pointercancel', stop)
		},
	}
}

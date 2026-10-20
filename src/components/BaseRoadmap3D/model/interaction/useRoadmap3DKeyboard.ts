import { cameraKeyAction } from '@/scene3d/camera/cameraKeys'
import type { Roadmap3DKeyboardOptions } from '../../types/internal/roadmap3dCompose.types'

function runCamera(options: Roadmap3DKeyboardOptions, event: KeyboardEvent): boolean {
	const action = cameraKeyAction(event, { hasQuarterTurns: true })
	if (!action) return false
	const { camera } = options
	if (action.type === 'rotate') {
		if (Math.abs(action.degrees) >= 90) camera.rotate(action.degrees > 0 ? 1 : -1)
		else camera.turn(action.degrees)
	} else if (action.type === 'tilt') camera.tilt(action.degrees)
	else if (action.type === 'zoom') (action.direction > 0 ? camera.zoomIn : camera.zoomOut)()
	else camera.home()
	return true
}

export function useRoadmap3DKeyboard(options: Roadmap3DKeyboardOptions) {
	const { focus, model } = options

	function open(): void {
		const stages = options.getStages()
		const id = focus.cursor.value ?? stages.find(stage => stage.status === 'current')?.id ?? stages[0]?.id ?? null
		if (id) focus.focusStage(id)
	}

	function escape(): void {
		if (model.selectedId.value !== null) model.selectTopic(null)
		else focus.overview()
	}

	function shift(event: KeyboardEvent): boolean {
		const id = focus.focused.value
		if (!event.altKey || id === null || !options.isEditing()) return false
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return false
		void options.edit.shift(id, event.key === 'ArrowLeft' ? -1 : 1)
		return true
	}

	const keys: Record<string, () => void> = {
		ArrowLeft: () => focus.step(-1),
		ArrowUp: () => focus.step(-1),
		ArrowRight: () => focus.step(1),
		ArrowDown: () => focus.step(1),
		Home: focus.first,
		End: focus.last,
		Enter: open,
		' ': open,
		Escape: escape,
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.target !== event.currentTarget) return
		options.tour.stop()
		if (shift(event)) return event.preventDefault()
		const handler = event.shiftKey || event.ctrlKey || event.metaKey || event.altKey ? undefined : keys[event.key]
		if (handler) {
			event.preventDefault()
			handler()
		} else if (runCamera(options, event)) event.preventDefault()
	}

	return { onKeydown }
}

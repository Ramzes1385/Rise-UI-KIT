import { nextSpot } from '@/scene3d/input/spatialNav'
import { arrowDirection, DEFAULT_GRID } from './drag/gridSnap'
import type { Scene3DLabels } from '@/scene3d/types/internal/scene3dInternal.types'
import type { FlowMap3DEditKeyboardParts } from '../../types/internal/flowMap3dEdit.types'
import type { Scene3DDirection, Scene3DSpot } from '@/scene3d/types/internal/scene3dGeometry.types'

const DIRECTIONS: Record<string, Scene3DDirection> = { arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down' }

function visibleSpots(labels: Scene3DLabels): Scene3DSpot[] {
	return [...labels.spots].flatMap(([id, spot]) => (spot.isVisible ? [{ id, x: spot.x, y: spot.y }] : []))
}

function escape(parts: FlowMap3DEditKeyboardParts): boolean {
	if (parts.drag.cancel()) return true
	if (parts.tool.value === 'link') {
		parts.setTool('select')
		return true
	}
	if (!parts.palette.isOpen.value) return false
	parts.palette.close()
	return true
}

function aimLink(parts: FlowMap3DEditKeyboardParts, direction: Scene3DDirection): void {
	const from = parts.connect.target.value ?? parts.targets()[0] ?? null
	const found = nextSpot(visibleSpots(parts.labels), from, direction)
	if (found) parts.connect.aim(found.id)
}

function nudge(parts: FlowMap3DEditKeyboardParts, event: KeyboardEvent): boolean {
	const ids = parts.targets()
	if (ids.length === 0) return false
	const grid = parts.model.data.value.layout?.gridSize ?? parts.model.notation.value.layout?.gridSize
	const step = grid || DEFAULT_GRID
	const vector = arrowDirection(event.key, parts.camera.azimuth())
	void parts.actions.nudge(ids, { x: vector.x * step, y: vector.z * step })
	return true
}

function arrow(parts: FlowMap3DEditKeyboardParts, event: KeyboardEvent): boolean {
	if (parts.tool.value !== 'link') return nudge(parts, event)
	aimLink(parts, DIRECTIONS[event.key.toLowerCase()])
	return true
}

function enter(parts: FlowMap3DEditKeyboardParts): boolean {
	if (parts.tool.value === 'link') {
		void Promise.resolve(parts.connect.commit()).then(isDone => isDone && parts.setTool('select'))
		return true
	}
	if (parts.model.selection.value.length === 0) return false
	parts.openInspector()
	return true
}

function letter(parts: FlowMap3DEditKeyboardParts, key: string): boolean {
	const ids = parts.targets()
	if (ids.length === 0 || (key !== 'delete' && parts.isTyping())) return false
	if (key === 'r') void parts.actions.rotate(ids)
	else if (key === 'c') parts.setTool(parts.tool.value === 'link' ? 'select' : 'link')
	else void parts.actions.remove(ids)
	return true
}

function modified(parts: FlowMap3DEditKeyboardParts, event: KeyboardEvent, key: string): boolean {
	if (event.altKey || (key !== 'z' && key !== 'y')) return false
	if (key === 'y' || event.shiftKey) parts.actions.redo()
	else parts.actions.undo()
	return true
}

function plain(parts: FlowMap3DEditKeyboardParts, event: KeyboardEvent, key: string): boolean {
	if (key === 'escape') return escape(parts)
	if (event.altKey || event.shiftKey) return false
	if (DIRECTIONS[key]) return arrow(parts, event)
	if (key === 'enter') return enter(parts)
	if (key === 'r' || key === 'c') return letter(parts, key)
	return key === 'delete' || key === 'backspace' ? letter(parts, 'delete') : false
}

export function useEdit3DKeyboard(parts: FlowMap3DEditKeyboardParts): (event: KeyboardEvent) => boolean {
	return event => {
		if (!parts.isActive.value || event.target !== event.currentTarget) return false
		const key = event.key.toLowerCase()
		const isHandled = event.ctrlKey || event.metaKey ? modified(parts, event, key) : plain(parts, event, key)
		if (isHandled) event.preventDefault()
		return isHandled
	}
}

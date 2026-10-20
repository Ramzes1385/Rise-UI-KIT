import { ref } from 'vue'
import { groundPoint } from './groundRay'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { footprintOf, gridOf, targetAt } from './gridSnap'
import type {
	FlowMap3DDragParts,
	FlowMap3DDragSession,
	FlowMap3DDragState,
	FlowMap3DNodeDrag,
} from '../../../types/internal/flowMap3dEdit.types'

const DRAG_THRESHOLD = 4

function gridStep(parts: FlowMap3DDragParts): number {
	return gridOf(parts.model.data.value.layout?.gridSize, parts.model.notation.value.layout?.gridSize)
}

function groundOf(parts: FlowMap3DDragParts, event: PointerEvent, session: Pick<FlowMap3DDragSession, 'item'>) {
	const host = parts.hostRef.value
	if (!host) return null
	const view = { camera: parts.viewport.camera.value, rect: host.getBoundingClientRect() }
	return groundPoint(view, { x: event.clientX, y: event.clientY }, session.item.base)
}

function showGhost(parts: FlowMap3DDragParts, session: FlowMap3DDragSession): void {
	const { item, target } = session
	if (!target) return
	const size = footprintOf(item, parts.getSnapshot())
	parts.getOverlay()?.showGhost({ x: target.x, z: target.z, y: item.base, size, height: item.height, isValid: target.isFree })
}

function moveSession(parts: FlowMap3DDragParts, session: FlowMap3DDragSession, event: PointerEvent): boolean {
	const { start, item, offset } = session
	const isNear = Math.hypot(event.clientX - start.x, event.clientY - start.y) < DRAG_THRESHOLD
	if (!session.isMoving && isNear) return false
	if (!session.isMoving && !parts.model.selection.value.includes(item.id)) parts.pick.pick({ entity: 'node', id: item.id })
	session.isMoving = true
	const point = groundOf(parts, event, session)
	if (!point) return true
	const view = { snapshot: parts.getSnapshot(), grid: gridStep(parts) }
	session.target = targetAt(item, { x: point.x + offset.x, z: point.z + offset.z }, view)
	showGhost(parts, session)
	return true
}

async function commitSession(parts: FlowMap3DDragParts, session: FlowMap3DDragSession): Promise<void> {
	const { item, target } = session
	if (!target) return
	if (!target.isFree) return parts.notify({ text: UI_FLOW_MAP_3D.EDIT_BLOCKED, kind: 'warning' })
	if (target.position.x === item.rect.x && target.position.y === item.rect.y) return
	const result = await parts.controller.move([item.id], { [item.id]: target.position })
	const reason = result.reject?.message ?? UI_FLOW_MAP_3D.EDIT_NOT_APPLIED
	parts.notify(result.isApplied ? { text: UI_FLOW_MAP_3D.EDIT_MOVED, kind: 'ok' } : { text: reason, kind: 'warning' })
}

function startSession(parts: FlowMap3DDragParts, id: string, event: PointerEvent): FlowMap3DDragSession | null {
	const item = parts.getSnapshot().nodes.find(entry => entry.id === id)
	if (!item) return null
	const point = groundOf(parts, event, { item })
	const offset = point ? { x: item.x - point.x, z: item.z - point.z } : { x: 0, z: 0 }
	return { item, start: { x: event.clientX, y: event.clientY }, offset, isMoving: false, target: null }
}

export function useNodeDrag(parts: FlowMap3DDragParts) {
	const isDragging = ref(false)
	const state: FlowMap3DDragState = { session: null, isClickSpent: false }

	function spendClick(): void {
		state.isClickSpent = true
		setTimeout(() => (state.isClickSpent = false), 0)
	}

	function stop(): void {
		window.removeEventListener('pointermove', onMove)
		window.removeEventListener('pointerup', onUp)
		window.removeEventListener('pointercancel', stop)
		parts.camera.setOrbit(true)
		parts.getOverlay()?.hide()
		isDragging.value = false
		state.session = null
	}

	function onMove(event: PointerEvent): void {
		if (state.session && moveSession(parts, state.session, event)) isDragging.value = true
	}

	function onUp(): void {
		const done = state.session
		stop()
		if (!done?.isMoving) return
		spendClick()
		void commitSession(parts, done)
	}

	function begin(id: string, event: PointerEvent): void {
		if (state.session) return
		state.session = startSession(parts, id, event)
		if (!state.session) return
		parts.camera.setOrbit(false)
		window.addEventListener('pointermove', onMove)
		window.addEventListener('pointerup', onUp)
		window.addEventListener('pointercancel', stop)
	}

	function cancel(): boolean {
		const wasMoving = Boolean(state.session?.isMoving)
		stop()
		if (wasMoving) spendClick()
		if (wasMoving) parts.notify({ text: UI_FLOW_MAP_3D.EDIT_CANCELLED, kind: 'ok' })
		return wasMoving
	}

	const node: FlowMap3DNodeDrag = { isDragging, cancel }
	return { ...node, begin, consumeClick: () => state.isClickSpent, dispose: stop }
}

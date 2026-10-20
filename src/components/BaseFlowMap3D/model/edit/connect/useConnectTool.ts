import { ref } from 'vue'
import { footprintOf } from '../drag/gridSnap'
import { groundPoint } from '../drag/groundRay'
import { connectVerdict } from './connectRules'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import type { FlowMap3DNodeItem } from '../../../types/internal/flowMap3dInternal.types'
import type { FlowMap3DConnectParts, FlowMap3DConnectTool } from '../../../types/internal/flowMap3dEdit.types'

const LIFT = 0.06
const RING_SCALE = 1.2

function itemOf(parts: FlowMap3DConnectParts, id: string | null): FlowMap3DNodeItem | undefined {
	return id ? parts.getSnapshot().nodes.find(item => item.id === id) : undefined
}

function refusalOf(parts: FlowMap3DConnectParts, id: string | null): string {
	const source = parts.getSource()
	if (!source || !id || id === source) return ''
	const verdict = connectVerdict(parts.model, source, id)
	return verdict.isAllowed ? '' : verdict.message
}

function endOf(from: FlowMap3DNodeItem, goal: FlowMap3DNodeItem | undefined, free: { x: number; z: number } | null) {
	if (goal) return { x: goal.x, z: goal.z, y: goal.elevation }
	return { x: free?.x ?? from.x, z: free?.z ?? from.z, y: from.elevation }
}

function drawLink(parts: FlowMap3DConnectParts, aim: { id: string | null; free: { x: number; z: number } | null }, isValid: boolean): void {
	const from = itemOf(parts, parts.getSource())
	const overlay = parts.getOverlay()
	if (!overlay || !from) return
	const goal = aim.id === from.id ? undefined : itemOf(parts, aim.id)
	const end = endOf(from, goal, aim.free)
	const ring = goal ? { x: goal.x, y: goal.elevation, z: goal.z, size: footprintOf(goal, parts.getSnapshot()) * RING_SCALE } : null
	overlay.showLink({
		from: { x: from.x, y: from.elevation + LIFT, z: from.z },
		to: { x: end.x, y: end.y + LIFT, z: end.z },
		isValid,
		ring,
	})
}

function freePoint(parts: FlowMap3DConnectParts, event: PointerEvent): { x: number; z: number } | null {
	const item = itemOf(parts, parts.getSource())
	const host = parts.hostRef.value
	if (!item || !host) return null
	const view = { camera: parts.viewport.camera.value, rect: host.getBoundingClientRect() }
	return groundPoint(view, { x: event.clientX, y: event.clientY }, item.elevation)
}

function announceAim(parts: FlowMap3DConnectParts, id: string | null, refusal: string): void {
	const name = id ? parts.model.graph.value.nodes.get(id)?.label : undefined
	if (!name || id === parts.getSource()) return
	const text = refusal
		? formatMessage(UI_FLOW_MAP_3D.LINK_CANNOT, { name, reason: refusal })
		: formatMessage(UI_FLOW_MAP_3D.LINK_CAN, { name })
	parts.announce(text)
}

export function useConnectTool(
	parts: FlowMap3DConnectParts,
): FlowMap3DConnectTool & { track: (event: PointerEvent, id: string | null) => void } {
	const target = ref<string | null>(null)
	const refusal = ref('')

	function aim(id: string | null): void {
		target.value = id
		refusal.value = refusalOf(parts, id)
		drawLink(parts, { id, free: null }, refusal.value === '')
		announceAim(parts, id, refusal.value)
	}

	function clear(): void {
		target.value = null
		refusal.value = ''
		parts.getOverlay()?.hide()
	}

	function track(event: PointerEvent, id: string | null): void {
		target.value = id
		refusal.value = refusalOf(parts, id)
		drawLink(parts, { id, free: freePoint(parts, event) }, refusal.value === '')
	}

	async function commit(id: string | null = target.value): Promise<boolean> {
		const source = parts.getSource()
		if (!source || !id || id === source) return false
		const isDone = await parts.actions.connect(source, id)
		if (isDone) clear()
		return isDone
	}

	return { target, refusal, aim, clear, track, commit }
}

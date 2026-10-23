import { pickNodeId } from '@/scene3d/input/raycast'
import { toNdc } from '@/scene3d/overlay/projection'
import { useScenePinch } from '@/scene3d/input/useScenePinch'
import { LABEL_ID_ATTR } from '@/scene3d/overlay/useSceneLabels'
import { useScenePointer } from '@/scene3d/input/useScenePointer'
import type { FlowMap3DPointerOptions } from '../../types/internal/flowMap3dInternal.types'

const DRAG_THRESHOLD = 4

export function tagIdOf(target: EventTarget | null): string | null {
	return target instanceof Element ? (target.closest(`[${LABEL_ID_ATTR}]`)?.getAttribute(LABEL_ID_ATTR) ?? null) : null
}

export function createPickAt(options: Pick<FlowMap3DPointerOptions, 'hostRef' | 'getContent' | 'getCamera'>) {
	return (x: number, y: number): string | null => {
		const content = options.getContent()
		const host = options.hostRef.value
		const ndc = host ? toNdc(x, y, host.getBoundingClientRect()) : null
		return content && ndc ? pickNodeId(content.nodes.group, { camera: options.getCamera(), ndc }) : null
	}
}

export function useFlowMap3DPointer(options: FlowMap3DPointerOptions) {
	const { pick } = options
	let start: { x: number; y: number } | null = null
	let isHit = false
	const pickAt = createPickAt(options)
	const idAt = (event: MouseEvent): string | null => tagIdOf(event.target) ?? pickAt(event.clientX, event.clientY)
	const pointer = useScenePointer({
		markerAt: tagIdOf,
		pickAt,
		setHover: id => pick.hover(id ? { entity: 'node', id } : null),
		activate: (id, event) => {
			isHit = true
			pick.pick({ entity: 'node', id }, event as MouseEvent)
		},
	})
	const pinch = useScenePinch(options.pinchZoom)

	return {
		onPointerDown(event: PointerEvent): void {
			start = { x: event.clientX, y: event.clientY }
			pointer.onPointerDown(event)
			pinch.onPointerDown(event)
		},
		onPointerMove(event: PointerEvent): void {
			pointer.onPointerMove(event)
			pinch.onPointerMove(event)
		},
		onPointerUp: pinch.onPointerUp,
		onPointerLeave: pointer.onPointerLeave,
		onClick(event: MouseEvent): void {
			isHit = false
			pointer.onClick(event)
			const from = start
			start = null
			const isDrag = from ? Math.hypot(event.clientX - from.x, event.clientY - from.y) > DRAG_THRESHOLD : false
			if (!isHit && !isDrag && !tagIdOf(event.target)) pick.clear()
		},
		onDblClick(event: MouseEvent): void {
			const id = idAt(event)
			if (id) pick.open({ entity: 'node', id }, event)
		},
		onContextMenu(event: MouseEvent): void {
			const id = idAt(event)
			if (!id) return
			event.preventDefault()
			pick.menu({ entity: 'node', id }, event)
		},
	}
}

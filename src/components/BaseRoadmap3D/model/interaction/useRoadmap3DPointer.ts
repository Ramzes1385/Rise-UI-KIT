import { pickNodeId } from '@/scene3d/input/raycast'
import { toNdc } from '@/scene3d/overlay/projection'
import { useScenePinch } from '@/scene3d/input/useScenePinch'
import { LABEL_ID_ATTR } from '@/scene3d/overlay/useSceneLabels'
import { useScenePointer } from '@/scene3d/input/useScenePointer'
import { ROADMAP_3D_GOAL, ROADMAP_3D_START } from '../data/roadmap3dTags'
import type { Roadmap3DPointerOptions } from '../../types/internal/roadmap3dCompose.types'

const DRAG_THRESHOLD = 4
const EDGE_IDS: readonly string[] = [ROADMAP_3D_START, ROADMAP_3D_GOAL]

function tagIdOf(target: EventTarget | null): string | null {
	const id = target instanceof Element ? (target.closest(`[${LABEL_ID_ATTR}]`)?.getAttribute(LABEL_ID_ATTR) ?? null) : null
	return id !== null && EDGE_IDS.includes(id) ? null : id
}

export function useRoadmap3DPointer(options: Roadmap3DPointerOptions) {
	let start: { x: number; y: number } | null = null
	let isHit = false

	function pickAt(x: number, y: number): string | null {
		const content = options.getContent()
		const host = options.hostRef.value
		const ndc = host ? toNdc(x, y, host.getBoundingClientRect()) : null
		return content && ndc ? pickNodeId(content.root, { camera: options.getCamera(), ndc }) : null
	}

	const pointer = useScenePointer({
		markerAt: tagIdOf,
		pickAt,
		setHover: id => options.pick.hover(id),
		activate: id => {
			isHit = true
			options.pick.pick(id)
		},
	})
	const pinch = useScenePinch(options.pinchZoom)

	return {
		onPointerDown(event: PointerEvent): void {
			options.pick.input()
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
			if (!isHit && !isDrag && !tagIdOf(event.target)) options.pick.clear()
		},
	}
}

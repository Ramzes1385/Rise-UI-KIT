import type { FlowEdgeKindDef } from '../../types/api/flowNotation.types'
import type { FlowMarkerDef } from '../../types/internal/core/flowRenderInternal.types'

const END: Record<string, FlowMarkerDef> = {
	arrow: { id: 'arrow', paths: ['M0 0L10 5L0 10Z'], isFilled: true, refX: 9 },
	'open-arrow': { id: 'open-arrow', paths: ['M1 1L9 5L1 9'], isFilled: false, refX: 9 },
	'double-arrow': { id: 'double-arrow', paths: ['M0 1L4 5L0 9', 'M5 1L9 5L5 9'], isFilled: false, refX: 9 },
	cross: { id: 'cross', paths: ['M1 1L9 9', 'M9 1L1 9'], isFilled: false, refX: 5 },
}

const START: Record<string, FlowMarkerDef> = {
	circle: { id: 'circle', paths: ['M1 5A4 4 0 1 0 9 5A4 4 0 1 0 1 5Z'], isFilled: false, refX: 1 },
	diamond: { id: 'diamond', paths: ['M0 5L5 1L10 5L5 9Z'], isFilled: false, refX: 1 },
	slash: { id: 'slash', paths: ['M3 10L7 0'], isFilled: false, refX: 5 },
}

export function endMarkerOf(kind: FlowEdgeKindDef): FlowMarkerDef | null {
	return END[kind.endMarker ?? 'none'] ?? null
}

export function startMarkerOf(kind: FlowEdgeKindDef): FlowMarkerDef | null {
	return START[kind.startMarker ?? 'none'] ?? null
}

export function collectMarkers(kinds: readonly FlowEdgeKindDef[]): FlowMarkerDef[] {
	const found = new Map<string, FlowMarkerDef>()
	for (const kind of kinds) {
		for (const marker of [endMarkerOf(kind), startMarkerOf(kind)]) if (marker) found.set(marker.id, marker)
	}
	return [...found.values()]
}

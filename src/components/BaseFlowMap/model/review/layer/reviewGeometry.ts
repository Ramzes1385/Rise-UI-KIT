import type { FlowRoute } from '../../../types/api/flowLayout.types'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'
import type { ReviewGhostSpot } from '../../../types/internal/review/reviewState.types'
import type { FlowEdge, FlowNode, FlowPoint, FlowRect, FlowSize } from '../../../types/data/flowData.types'

const GHOST_GAP = 48

export function centerOf(rect: FlowRect): FlowPoint {
	return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function clipToRect(rect: FlowRect, toward: FlowPoint): FlowPoint {
	const center = centerOf(rect)
	const dx = toward.x - center.x
	const dy = toward.y - center.y
	if (dx === 0 && dy === 0) return center
	const scale = Math.min(rect.width / 2 / Math.abs(dx || Infinity), rect.height / 2 / Math.abs(dy || Infinity))
	return { x: center.x + dx * scale, y: center.y + dy * scale }
}

export function linePath(source: FlowRect, target: FlowRect): string {
	const from = clipToRect(source, centerOf(target))
	const to = clipToRect(target, centerOf(source))
	return `M${from.x} ${from.y}L${to.x} ${to.y}`
}

export function ghostSize(node: FlowNode, base: FlowSize): FlowSize {
	return { width: node.size?.width ?? base.width, height: node.size?.height ?? base.height }
}

export function placeGhost(node: FlowNode, spot: ReviewGhostSpot): FlowRect {
	const { size, neighbour, bounds } = spot
	if (node.position) return { ...node.position, ...size }
	if (neighbour) return { x: neighbour.x, y: neighbour.y + neighbour.height + GHOST_GAP, ...size }
	return { x: bounds.x + bounds.width + GHOST_GAP, y: bounds.y, ...size }
}

function otherEnd(edge: FlowEdge, nodeId: string): string | null {
	if (edge.source === nodeId) return edge.target
	return edge.target === nodeId ? edge.source : null
}

export function edgeNeighbour(edges: readonly FlowEdge[], nodeId: string, known: ReadonlyMap<string, FlowRect>): FlowRect | undefined {
	for (const edge of edges) {
		const other = otherEnd(edge, nodeId)
		const rect = other === null ? undefined : known.get(other)
		if (rect) return rect
	}
	return undefined
}

export function glyphAt(rect: FlowRect): FlowPoint {
	return { x: rect.x + 10, y: rect.y - 8 }
}

function midPoint(points: readonly FlowPoint[]): FlowPoint {
	if (points.length === 0) return { x: 0, y: 0 }
	const first = points[0]
	const last = points[points.length - 1]
	return points.length > 2 ? points[Math.floor(points.length / 2)] : { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 }
}

export function pathMid(route: FlowRoute | undefined): FlowPoint | undefined {
	if (!route) return undefined
	return route.label?.point ?? midPoint(route.points)
}

export function pinAnchor(
	thread: FlowCommentThread,
	scene: { nodes: Record<string, FlowRect>; groups: Record<string, FlowRect>; routes: Record<string, FlowRoute> },
): FlowPoint | undefined {
	const { target, point } = thread
	if (!target) return point
	if (target.entity === 'node') {
		const rect = scene.nodes[target.id]
		return rect ? { x: rect.x + rect.width, y: rect.y } : undefined
	}
	if (target.entity === 'edge') return pathMid(scene.routes[target.id])
	const group = target.entity === 'group' ? scene.groups[target.id] : undefined
	return group ? { x: group.x + 8, y: group.y + 8 } : undefined
}

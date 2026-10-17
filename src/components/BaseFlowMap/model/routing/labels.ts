import type { FlowRoute } from '../../types/api/flowLayout.types'
import type { FlowPoint, FlowRect } from '../../types/data/flowData.types'
import type { LabelRequest } from '../../types/internal/core/flowRouteInternal.types'

const CELL = 64
const FRACTIONS = [0.5, 0.35, 0.65, 0.2, 0.8]
const GAP = 4

function lengthOf(points: readonly FlowPoint[]): number {
	let sum = 0
	for (let index = 1; index < points.length; index += 1)
		sum += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y)
	return sum
}

function pointAlong(points: readonly FlowPoint[], fraction: number): { point: FlowPoint; normal: FlowPoint } {
	let left = lengthOf(points) * fraction
	for (let index = 1; index < points.length; index += 1) {
		const [a, b] = [points[index - 1], points[index]]
		const size = Math.hypot(b.x - a.x, b.y - a.y)
		if (left <= size || index === points.length - 1) {
			const ratio = size === 0 ? 0 : Math.min(left / size, 1)
			const normal = size === 0 ? { x: 0, y: -1 } : { x: -(b.y - a.y) / size, y: (b.x - a.x) / size }
			return { point: { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio }, normal }
		}
		left -= size
	}
	return { point: points[0], normal: { x: 0, y: -1 } }
}

class RectGrid {
	private readonly cells = new Map<string, FlowRect[]>()

	add(rect: FlowRect): void {
		for (const key of this.keys(rect)) {
			const bucket = this.cells.get(key)
			if (bucket) bucket.push(rect)
			else this.cells.set(key, [rect])
		}
	}

	hits(rect: FlowRect): boolean {
		return this.keys(rect).some(key => (this.cells.get(key) ?? []).some(other => overlaps(rect, other)))
	}

	private keys(rect: FlowRect): string[] {
		const keys: string[] = []
		const [x0, x1] = [Math.floor(rect.x / CELL), Math.floor((rect.x + rect.width) / CELL)]
		const [y0, y1] = [Math.floor(rect.y / CELL), Math.floor((rect.y + rect.height) / CELL)]
		for (let x = x0; x <= x1; x += 1) {
			for (let y = y0; y <= y1; y += 1) keys.push(`${x}:${y}`)
		}
		return keys
	}
}

function overlaps(a: FlowRect, b: FlowRect): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function candidates(request: LabelRequest): FlowRect[] {
	const shifts = [0, -(request.height / 2 + GAP), request.height / 2 + GAP]
	return FRACTIONS.flatMap(fraction =>
		shifts.map(shift => {
			const { point, normal } = pointAlong(request.points, fraction)
			const center = { x: point.x + normal.x * shift, y: point.y + normal.y * shift }
			return { x: center.x - request.width / 2, y: center.y - request.height / 2, width: request.width, height: request.height }
		}),
	)
}

export function placeLabels(requests: readonly LabelRequest[], obstacles: readonly FlowRect[]): Record<string, FlowRoute['label']> {
	const grid = new RectGrid()
	for (const obstacle of obstacles) grid.add(obstacle)
	const result: Record<string, FlowRoute['label']> = {}
	for (const request of requests) {
		const free = candidates(request).find(rect => !grid.hits(rect))
		result[request.id] = free ? { point: { x: free.x + free.width / 2, y: free.y + free.height / 2 }, angle: 0 } : null
		if (free) grid.add(free)
	}
	return result
}

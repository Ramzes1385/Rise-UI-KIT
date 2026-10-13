import { Shape, Vector2 } from 'three'
import { shapeNarrowest } from '../../../../model/scene/geometry/extrudeShapes'
import { narrowestGap, ringEdges } from '../../../../model/scene/geometry/narrowestGap'

const MIN_EDGE = 1e-6
const SLACK = 1e-9

function random(seed: number): () => number {
	const state = { value: seed }
	return () => {
		state.value = (state.value * 1664525 + 1013904223) % 4294967296
		return state.value / 4294967296
	}
}

function scribble(next: () => number, count: number, spread: number): Vector2[] {
	return Array.from({ length: count }, (_, index) => {
		const angle = (index / count) * Math.PI * 2
		const radius = 40 + next() * spread
		return new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius)
	})
}

function segmentDistance(point: Vector2, [start, end]: [Vector2, Vector2]): number {
	const dx = end.x - start.x
	const dy = end.y - start.y
	const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)
	return t < -SLACK || t > 1 + SLACK ? Infinity : Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy)
}

function pairwiseNarrowest(rings: Vector2[][], cap: number): number {
	const edges = ringEdges(rings)
	const points = edges.map(([start]) => start)
	return edges.reduce((narrowest, edge) => {
		const gaps = points.filter(point => edge.every(end => end.distanceTo(point) > MIN_EDGE)).map(point => segmentDistance(point, edge))
		return Math.min(narrowest, ...gaps)
	}, cap)
}

function traced(count: number): Shape {
	const next = random(7)
	const shape = new Shape(scribble(next, count, 3))
	shape.closePath()
	return shape
}

describe('narrowestGap: дерево рамок вместо перебора всех пар', () => {
	it.each([3, 5, 12, 40, 150, 400])('контур из %i вершин: результат совпадает с перебором пар', count => {
		const next = random(count)
		for (let round = 0; round < 12; round += 1) {
			const rings = [scribble(next, count, 60), scribble(next, Math.max(3, count >> 1), 30)]
			const cap = 1 + next() * 80
			expect(narrowestGap(ringEdges(rings), cap)).toBe(pairwiseNarrowest(rings, cap))
		}
	})

	it('контур без рёбер и выродившиеся рёбра: предел', () => {
		const point = new Vector2(1, 1)
		expect(narrowestGap(ringEdges([[]]), 7)).toBe(7)
		expect(narrowestGap(ringEdges([[point, point.clone(), point.clone()]]), 7)).toBe(7)
	})

	it('перемычка и пределы: ближайшее противоположное ребро ограничено пределом', () => {
		const strip = [new Vector2(0, 0), new Vector2(100, 0), new Vector2(100, 4), new Vector2(0, 4)]
		expect(narrowestGap(ringEdges([strip]), 100)).toBeCloseTo(4, 6)
		expect(narrowestGap(ringEdges([strip]), 2)).toBe(2)
	})

	it('фигура из 8000 вершин считается быстрее 100 мс, а рост вершин в 4 раза не даёт роста времени в 16', () => {
		const timeOf = (count: number): number => {
			const shape = traced(count)
			shapeNarrowest(shape, 40, 24)
			return Math.min(
				...Array.from({ length: 5 }, () => {
					const started = performance.now()
					shapeNarrowest(shape, 40, 24)
					return performance.now() - started
				}),
			)
		}
		const small = timeOf(2000)
		const large = timeOf(8000)
		expect(large).toBeLessThan(100)
		expect(large).toBeLessThan(small * 12)
	})
})

import type { FlowRoute } from '../../../types/api/flowLayout.types'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'
import {
	centerOf,
	edgeNeighbour,
	ghostSize,
	glyphAt,
	linePath,
	pathMid,
	pinAnchor,
	placeGhost,
} from '../../../model/review/layer/reviewGeometry'

const rect = (x: number, y: number, size = { width: 100, height: 40 }) => ({ x, y, ...size })

describe('centerOf и glyphAt', () => {
	it('центр рамки и точка значка над левым краем', () => {
		expect(centerOf(rect(10, 20))).toEqual({ x: 60, y: 40 })
		expect(glyphAt(rect(10, 20))).toEqual({ x: 20, y: 12 })
	})
})

describe('linePath', () => {
	it('по диагонали линия идёт между краями рамок', () => {
		expect(linePath(rect(0, 0, { width: 100, height: 100 }), rect(200, 200, { width: 100, height: 100 }))).toBe('M100 100L200 200')
	})

	it('по горизонтали и вертикали путь остаётся корректным, без NaN', () => {
		expect(linePath(rect(0, 0), rect(300, 0))).toMatch(/^M-?\d+(\.\d+)? 20L-?\d+(\.\d+)? 20$/)
		expect(linePath(rect(0, 0), rect(0, 200))).toMatch(/^M50 -?\d+(\.\d+)?L50 -?\d+(\.\d+)?$/)
	})

	it('совпавшие центры дают точку в центре', () => {
		expect(linePath(rect(0, 0), rect(0, 0))).toBe('M50 20L50 20')
	})
})

describe('ghostSize', () => {
	it('размер узла или базовый размер нотации', () => {
		const base = { width: 180, height: 64 }
		expect(ghostSize({ id: 'n', kind: 'k', label: 'n', size: { width: 10, height: 20 } }, base)).toEqual({ width: 10, height: 20 })
		expect(ghostSize({ id: 'n', kind: 'k', label: 'n' }, base)).toEqual(base)
	})
})

describe('placeGhost', () => {
	const size = { width: 100, height: 40 }
	const bounds = rect(0, 0, { width: 500, height: 300 })

	it('позиция узла важнее всего', () => {
		expect(placeGhost({ id: 'n', kind: 'k', label: 'n', position: { x: 7, y: 8 } }, { size, bounds, neighbour: rect(1, 1) })).toEqual({
			x: 7,
			y: 8,
			...size,
		})
	})

	it('без позиции — под соседом', () => {
		expect(placeGhost({ id: 'n', kind: 'k', label: 'n' }, { size, bounds, neighbour: rect(10, 10) })).toEqual({ x: 10, y: 98, ...size })
	})

	it('без соседа — справа от карты', () => {
		expect(placeGhost({ id: 'n', kind: 'k', label: 'n' }, { size, bounds })).toEqual({ x: 548, y: 0, ...size })
	})
})

describe('edgeNeighbour', () => {
	const known = new Map([
		['a', rect(0, 0)],
		['b', rect(200, 0)],
	])

	it('другой конец связи с известным местом, с любой стороны', () => {
		const edges = [
			{ id: '1', source: 'x', target: 'y' },
			{ id: '2', source: 'n', target: 'a' },
			{ id: '3', source: 'b', target: 'n' },
		]
		expect(edgeNeighbour(edges, 'n', known)).toBe(known.get('a'))
		expect(edgeNeighbour(edges.slice(2), 'n', known)).toBe(known.get('b'))
	})

	it('если соседа нет — undefined', () => {
		expect(edgeNeighbour([{ id: '1', source: 'n', target: 'q' }], 'n', known)).toBeUndefined()
		expect(edgeNeighbour([], 'n', known)).toBeUndefined()
	})
})

describe('pathMid', () => {
	const route = (points: { x: number; y: number }[], label?: { point: { x: number; y: number } }): FlowRoute =>
		({ path: '', points, label: label ?? null }) as unknown as FlowRoute

	it('нет маршрута — нет точки', () => {
		expect(pathMid(undefined)).toBeUndefined()
	})

	it('точка подписи важнее геометрии', () => {
		expect(pathMid(route([{ x: 0, y: 0 }], { point: { x: 5, y: 6 } }))).toEqual({ x: 5, y: 6 })
	})

	it('два конца — середина отрезка, больше — средняя точка ломаной', () => {
		expect(
			pathMid(
				route([
					{ x: 0, y: 0 },
					{ x: 10, y: 20 },
				]),
			),
		).toEqual({ x: 5, y: 10 })
		expect(
			pathMid(
				route([
					{ x: 0, y: 0 },
					{ x: 4, y: 4 },
					{ x: 8, y: 0 },
				]),
			),
		).toEqual({ x: 4, y: 4 })
	})

	it('маршрут без точек — начало координат', () => {
		expect(pathMid(route([]))).toEqual({ x: 0, y: 0 })
	})
})

describe('pinAnchor', () => {
	const scene = {
		nodes: { a: rect(10, 20) },
		groups: { g: rect(100, 100, { width: 200, height: 200 }) },
		routes: {
			e: {
				path: '',
				points: [
					{ x: 0, y: 0 },
					{ x: 10, y: 10 },
				],
				label: null,
			} as unknown as FlowRoute,
		},
	}
	const thread = (patch: Partial<FlowCommentThread>): FlowCommentThread => ({ id: 't', comments: [], ...patch })

	it('к точке холста — сама точка', () => {
		expect(pinAnchor(thread({ point: { x: 3, y: 4 } }), scene)).toEqual({ x: 3, y: 4 })
		expect(pinAnchor(thread({}), scene)).toBeUndefined()
	})

	it('к узлу — правый верхний угол', () => {
		expect(pinAnchor(thread({ target: { entity: 'node', id: 'a' } }), scene)).toEqual({ x: 110, y: 20 })
		expect(pinAnchor(thread({ target: { entity: 'node', id: 'zz' } }), scene)).toBeUndefined()
	})

	it('к связи — середина маршрута', () => {
		expect(pinAnchor(thread({ target: { entity: 'edge', id: 'e' } }), scene)).toEqual({ x: 5, y: 5 })
		expect(pinAnchor(thread({ target: { entity: 'edge', id: 'zz' } }), scene)).toBeUndefined()
	})

	it('к группе — у левого верхнего угла; к сценарию — нигде', () => {
		expect(pinAnchor(thread({ target: { entity: 'group', id: 'g' } }), scene)).toEqual({ x: 108, y: 108 })
		expect(pinAnchor(thread({ target: { entity: 'group', id: 'zz' } }), scene)).toBeUndefined()
		expect(pinAnchor(thread({ target: { entity: 'scenario', id: 's' } }), scene)).toBeUndefined()
	})
})

import type { FlowShape } from '../../../../types/api/flowNotation.types'
import type { FlowPoint, FlowRect } from '../../../../types/data/flowData.types'
import { centerOf, clipToShape, endpoints, NORMALS, resolveSides } from '../../../../model/routing/shapes'

const rect: FlowRect = { x: 100, y: 50, width: 120, height: 60 }
const center = centerOf(rect)

function around(distance: number): FlowPoint[] {
	return Array.from({ length: 16 }, (_, index) => {
		const angle = (index / 16) * Math.PI * 2 + 0.1
		return { x: center.x + Math.cos(angle) * distance, y: center.y + Math.sin(angle) * distance }
	})
}

function isOnSegment(point: FlowPoint, from: FlowPoint, to: FlowPoint): boolean {
	const cross = (to.x - from.x) * (point.y - from.y) - (to.y - from.y) * (point.x - from.x)
	if (Math.abs(cross) > 1e-6) return false
	const dot = (point.x - from.x) * (to.x - from.x) + (point.y - from.y) * (to.y - from.y)
	return dot >= -1e-6 && dot <= (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + 1e-6
}

function onRectContour(point: FlowPoint): boolean {
	const inX = point.x >= rect.x - 1e-6 && point.x <= rect.x + rect.width + 1e-6
	const inY = point.y >= rect.y - 1e-6 && point.y <= rect.y + rect.height + 1e-6
	const onVertical = Math.abs(point.x - rect.x) < 1e-6 || Math.abs(point.x - rect.x - rect.width) < 1e-6
	const onHorizontal = Math.abs(point.y - rect.y) < 1e-6 || Math.abs(point.y - rect.y - rect.height) < 1e-6
	return inX && inY && (onVertical || onHorizontal)
}

const POLYGONS: Partial<Record<FlowShape, FlowPoint[]>> = {
	diamond: [
		{ x: 160, y: 50 },
		{ x: 220, y: 80 },
		{ x: 160, y: 110 },
		{ x: 100, y: 80 },
	],
	hexagon: [
		{ x: 130, y: 50 },
		{ x: 190, y: 50 },
		{ x: 220, y: 80 },
		{ x: 190, y: 110 },
		{ x: 130, y: 110 },
		{ x: 100, y: 80 },
	],
	parallelogram: [
		{ x: 124, y: 50 },
		{ x: 220, y: 50 },
		{ x: 196, y: 110 },
		{ x: 100, y: 110 },
	],
}

describe('clipToShape: концы на контуре фигуры', () => {
	it.each<{ shape: FlowShape }>([{ shape: 'rect' }, { shape: 'round-rect' }, { shape: 'cylinder' }, { shape: 'document' }])(
		'$shape: точка на границе прямоугольника по любому направлению',
		({ shape }) => {
			for (const toward of around(300)) expect(onRectContour(clipToShape(shape, rect, toward)), JSON.stringify(toward)).toBe(true)
		},
	)

	it.each<{ shape: FlowShape }>([{ shape: 'ellipse' }, { shape: 'circle' }, { shape: 'pill' }])(
		'$shape: точка лежит на эллипсе',
		({ shape }) => {
			for (const toward of around(300)) {
				const point = clipToShape(shape, rect, toward)
				const value = ((point.x - center.x) / (rect.width / 2)) ** 2 + ((point.y - center.y) / (rect.height / 2)) ** 2
				expect(value).toBeCloseTo(1, 6)
			}
		},
	)

	it.each<{ shape: FlowShape }>([{ shape: 'diamond' }, { shape: 'hexagon' }, { shape: 'parallelogram' }])(
		'$shape: точка лежит на ребре многоугольника',
		({ shape }) => {
			const polygon = POLYGONS[shape] as FlowPoint[]
			for (const toward of around(300)) {
				const point = clipToShape(shape, rect, toward)
				const isOn = polygon.some((from, index) => isOnSegment(point, from, polygon[(index + 1) % polygon.length]))
				expect(isOn, `${shape} ${JSON.stringify(toward)}`).toBe(true)
			}
		},
	)

	it('сторона по оси: без деления на ноль', () => {
		expect(clipToShape('rect', rect, { x: center.x, y: 500 })).toEqual({ x: center.x, y: rect.y + rect.height })
		expect(clipToShape('rect', rect, { x: 900, y: center.y })).toEqual({ x: rect.x + rect.width, y: center.y })
	})

	it('цель в центре фигуры — сам центр', () => {
		expect(clipToShape('diamond', rect, center)).toEqual(center)
	})

	it('луч, идущий вдоль ребра многоугольника, не даёт NaN', () => {
		const point = clipToShape('parallelogram', rect, { x: center.x, y: center.y - 1000 })
		expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true)
	})
})

describe('стороны и концы связи', () => {
	const left: FlowRect = { x: 0, y: 0, width: 100, height: 50 }
	const right: FlowRect = { x: 300, y: 0, width: 100, height: 50 }
	const below: FlowRect = { x: 0, y: 300, width: 100, height: 50 }
	const above: FlowRect = { x: 0, y: -300, width: 100, height: 50 }
	const layoutEdge = { id: 'e', source: 'a', target: 'b' }

	it('сторона выводится по взаимному положению: вправо, влево, вниз, вверх', () => {
		expect(resolveSides(layoutEdge, left, right)).toEqual({ out: 'right', into: 'left' })
		expect(resolveSides(layoutEdge, right, left)).toEqual({ out: 'left', into: 'right' })
		expect(resolveSides(layoutEdge, left, below)).toEqual({ out: 'bottom', into: 'top' })
		expect(resolveSides(layoutEdge, left, above)).toEqual({ out: 'top', into: 'bottom' })
	})

	it('заданные стороны главнее выведенных; auto выводится', () => {
		expect(resolveSides({ ...layoutEdge, sourceSide: 'top', targetSide: 'bottom' }, left, right)).toEqual({
			out: 'top',
			into: 'bottom',
		})
		expect(resolveSides({ ...layoutEdge, sourceSide: 'auto', targetSide: 'auto' }, left, right)).toEqual({ out: 'right', into: 'left' })
	})

	it('endpoints даёт середины сторон', () => {
		const ends = endpoints(layoutEdge, left, right)
		expect(ends.start).toEqual({ x: 100, y: 25 })
		expect(ends.end).toEqual({ x: 300, y: 25 })
		expect(endpoints({ ...layoutEdge, sourceSide: 'top', targetSide: 'bottom' }, left, right)).toMatchObject({
			start: { x: 50, y: 0 },
			end: { x: 350, y: 50 },
		})
		expect(endpoints({ ...layoutEdge, sourceSide: 'left', targetSide: 'right' }, left, right)).toMatchObject({
			start: { x: 0, y: 25 },
			end: { x: 400, y: 25 },
		})
	})

	it('NORMALS — единичные внешние нормали', () => {
		expect(NORMALS).toEqual({ top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } })
	})
})

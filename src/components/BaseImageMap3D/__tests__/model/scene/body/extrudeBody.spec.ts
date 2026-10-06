import { Box3, Shape, Vector3 } from 'three'
import type { BufferGeometry, ExtrudeGeometry } from 'three'
import type { SceneBody } from '../../../../types/internal/imageMap3dInternal.types'
import { bevelSizes, extrudeShapes, shapeHalfWidth } from '../../../../model/scene/geometry/extrudeShapes'

function rect(box: number[]): Shape {
	const [x, y, width, height] = box
	const shape = new Shape()
	shape.moveTo(x, y)
	shape.lineTo(x + width, y)
	shape.lineTo(x + width, y + height)
	shape.lineTo(x, y + height)
	shape.closePath()
	return shape
}

function circle(x: number, y: number, radius: number): Shape {
	const shape = new Shape()
	shape.absarc(x, y, radius, 0, Math.PI * 2, false)
	return shape
}

function ring(): Shape {
	const shape = rect([0, 0, 100, 100])
	const hole = rect([30, 30, 40, 40])
	hole.autoClose = true
	shape.holes.push(hole)
	return shape
}

function build(shapes: Shape[], body: Partial<SceneBody> & { height: number }): ExtrudeGeometry {
	return extrudeShapes(shapes, { base: 0, bevel: 0, ...body }) as ExtrudeGeometry
}

function bounds(geometry: BufferGeometry, level?: number): Box3 {
	const box = new Box3()
	const position = geometry.getAttribute('position')
	Array.from({ length: position.count }, (_, index) => new Vector3().fromBufferAttribute(position, index))
		.filter(point => level === undefined || Math.abs(point.y - level) < 1e-6)
		.forEach(point => box.expandByPoint(point))
	return box
}

function expectBox(box: Box3, expected: { x: [number, number]; y?: [number, number]; z: [number, number] }): void {
	expect([box.min.x, box.max.x]).toEqual(expected.x.map(value => expect.closeTo(value, 4)))
	expect([box.min.z, box.max.z]).toEqual(expected.z.map(value => expect.closeTo(value, 4)))
	if (expected.y) expect([box.min.y, box.max.y]).toEqual(expected.y.map(value => expect.closeTo(value, 4)))
}

describe('extrudeShapes без скоса', () => {
	it('стоит на полу: от 0 до высоты; x и z — как у фигуры', () => {
		expectBox(bounds(build([rect([10, 20, 100, 60])], { height: 40 })), { x: [10, 110], y: [0, 40], z: [20, 80] })
	})

	it('основание поднимает тело: от основания до основания + высоты', () => {
		expectBox(bounds(build([rect([0, 0, 10, 10])], { height: 40, base: 15 })), { x: [0, 10], y: [15, 55], z: [0, 10] })
	})

	it('нулевая высота — тонкая плита над основанием; без фигур геометрии нет', () => {
		expectBox(bounds(build([rect([0, 0, 10, 10])], { height: 0, base: 10 })), { x: [0, 10], y: [10, 10.5], z: [0, 10] })
		expect(extrudeShapes([], { height: 10, base: 0, bevel: 2 })).toBeNull()
	})

	it('несколько фигур объекта попадают в одну геометрию', () => {
		expectBox(bounds(build([rect([0, 0, 10, 10]), rect([50, 50, 10, 10])], { height: 8 })), { x: [0, 60], y: [0, 8], z: [0, 60] })
	})
})

describe('extrudeShapes со скосом', () => {
	it('на полу: верх на высоте, низ скоса под полом, стены по исходному контуру, крышка сжата на скос', () => {
		const geometry = build([rect([0, 0, 100, 60])], { height: 40, bevel: 4 })
		expectBox(bounds(geometry), { x: [0, 100], y: [-4, 40], z: [0, 60] })
		expectBox(bounds(geometry, 40), { x: [4, 96], z: [4, 56] })
		expectBox(bounds(geometry, 36), { x: [0, 100], z: [0, 60] })
		expectBox(bounds(geometry, 0), { x: [0, 100], z: [0, 60] })
	})

	it('парящая часть: скос сверху и снизу, между ними исходный контур', () => {
		const geometry = build([rect([0, 0, 100, 60])], { height: 10, base: 20, bevel: 2 })
		expectBox(bounds(geometry), { x: [0, 100], y: [20, 30], z: [0, 60] })
		expectBox(bounds(geometry, 30), { x: [2, 98], z: [2, 58] })
		expectBox(bounds(geometry, 20), { x: [2, 98], z: [2, 58] })
		expectBox(bounds(geometry, 22), { x: [0, 100], z: [0, 60] })
	})

	it('верх остаётся на base + height при любом скосе', () => {
		;[0, 1, 5, 50].forEach(bevel => {
			expect(bounds(build([rect([0, 0, 200, 200])], { height: 30, base: 7, bevel })).max.y).toBeCloseTo(37, 4)
			expect(bounds(build([rect([0, 0, 200, 200])], { height: 30, bevel })).max.y).toBeCloseTo(30, 4)
		})
	})

	it('скос по высоте — не больше четверти высоты тела', () => {
		const geometry = build([rect([0, 0, 100, 100])], { height: 4, bevel: 10 })
		expectBox(bounds(geometry), { x: [0, 100], y: [-1, 4], z: [0, 100] })
	})

	it('тонкая стена: скос не больше половины половинной толщины — крышка не схлопывается', () => {
		const geometry = build([rect([0, 0, 200, 4])], { height: 30, bevel: 5 })
		const top = bounds(geometry, 30)
		expect(top.min.z).toBeGreaterThan(0)
		expect(top.max.z - top.min.z).toBeGreaterThan(2)
		expect(top.min.z).toBeLessThan(1)
	})

	it('малый круг: скос ограничен долей радиуса', () => {
		const top = bounds(build([circle(50, 50, 10)], { height: 20, bevel: 5 }), 20)
		expect(top.max.x - top.min.x).toBeGreaterThan(14)
		expect(top.max.x - top.min.x).toBeLessThan(16)
	})

	it('фигура с дырой: стены дыры сохраняются, дыра у крышки расширяется', () => {
		const geometry = build([ring()], { height: 20, bevel: 2 })
		const walls = bounds(geometry, 0)
		expectBox(walls, { x: [0, 100], z: [0, 100] })
		const holeWall = Array.from({ length: geometry.getAttribute('position').count }, (_, index) =>
			new Vector3().fromBufferAttribute(geometry.getAttribute('position'), index),
		).filter(point => Math.abs(point.y) < 1e-6 && point.x > 1 && point.x < 99 && point.z > 1 && point.z < 99)
		expect(holeWall.length).toBeGreaterThan(0)
		holeWall.forEach(point => {
			expect(point.x >= 30 - 1e-6 && point.x <= 70 + 1e-6).toBe(true)
			expect(point.z >= 30 - 1e-6 && point.z <= 70 + 1e-6).toBe(true)
		})
	})

	it('вырожденная фигура без площади — без скоса, но не пустая геометрия', () => {
		const line = new Shape()
		line.moveTo(0, 0)
		line.lineTo(10, 0)
		line.lineTo(20, 0)
		line.closePath()
		expect(bevelSizes([line], 10, 2).size).toBe(0)
		expect(build([line], { height: 10, bevel: 2 }).getAttribute('position').count).toBeGreaterThan(0)
	})
})

describe('shapeHalfWidth и bevelSizes', () => {
	it('половина толщины фигуры — площадь, делённая на периметр', () => {
		expect(shapeHalfWidth(rect([0, 0, 100, 60]))).toBeCloseTo(18.75, 6)
		expect(shapeHalfWidth(rect([0, 0, 200, 4]))).toBeCloseTo(1.96, 2)
		expect(shapeHalfWidth(circle(0, 0, 10))).toBeCloseTo(5, 1)
	})

	it('дыры уменьшают площадь и прибавляют периметр', () => {
		expect(shapeHalfWidth(ring())).toBeCloseTo(15, 6)
	})

	it('вырожденная фигура — 0', () => {
		const line = new Shape()
		line.moveTo(0, 0)
		line.lineTo(5, 0)
		line.closePath()
		expect(shapeHalfWidth(line)).toBe(0)
		expect(shapeHalfWidth(new Shape())).toBe(0)
	})

	it('размеры скоса: по высоте — четверть, по ширине — половина половинной толщины, самая тонкая фигура объекта', () => {
		const sizes = bevelSizes([rect([0, 0, 100, 60]), rect([0, 0, 200, 4])], 40, 3)
		expect(sizes.thickness).toBe(3)
		expect(sizes.size).toBeCloseTo(0.98, 2)
		expect(bevelSizes([rect([0, 0, 100, 60])], 8, 5)).toEqual({ thickness: 2, size: 5 })
		expect(bevelSizes([rect([0, 0, 100, 60])], 8, 0)).toEqual({ thickness: 0, size: 0 })
	})
})

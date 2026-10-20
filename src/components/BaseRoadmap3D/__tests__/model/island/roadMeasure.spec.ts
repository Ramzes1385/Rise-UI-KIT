import { createRoadLayout } from '../../../model/island/roadPath'
import { createRoadTable, roadProgress, roadSegmentAt, samplePoint, stageRoadPositions } from '../../../model/island/roadMeasure'

const line = [
	{ x: 0, z: 0 },
	{ x: 0, z: 2 },
	{ x: 3, z: 2 },
]

describe('createRoadTable', () => {
	it('считает накопленную длину', () => {
		expect(createRoadTable(line)).toEqual({ cumulative: [0, 2, 5], total: 5 })
	})

	it('пустая дорога и одна точка — нулевая длина', () => {
		expect(createRoadTable([])).toEqual({ cumulative: [0], total: 0 })
		expect(createRoadTable([{ x: 1, z: 1 }]).total).toBe(0)
	})
})

describe('roadSegmentAt', () => {
	it('находит отрезок по расстоянию', () => {
		const table = createRoadTable(line)
		expect(roadSegmentAt(table, 0)).toBe(0)
		expect(roadSegmentAt(table, 1.9)).toBe(0)
		expect(roadSegmentAt(table, 2)).toBe(1)
		expect(roadSegmentAt(table, 99)).toBe(1)
	})

	it('для таблицы без отрезков возвращает 0', () => {
		expect(roadSegmentAt(createRoadTable([]), 3)).toBe(0)
	})
})

describe('stageRoadPositions', () => {
	it.each([1, 2, 6, 12, 24])('%i этапов: положения растут вдоль дороги в пределах 0..1', count => {
		for (const perRow of [2, 3, 4]) {
			const layout = createRoadLayout(count, perRow)
			const positions = stageRoadPositions(layout.road, layout.stages)
			expect(positions).toHaveLength(count)
			positions.forEach((value, index) => {
				expect(value).toBeGreaterThan(0)
				expect(value).toBeLessThan(1)
				if (index > 0) expect(value).toBeGreaterThan(positions[index - 1])
			})
		}
	})

	it('принимает готовую таблицу', () => {
		const layout = createRoadLayout(3, 3)
		const table = createRoadTable(layout.road)
		expect(stageRoadPositions(layout.road, layout.stages, table)).toEqual(stageRoadPositions(layout.road, layout.stages))
	})

	it('дорога без длины — нули', () => {
		const stages = [{ x: 0, z: 0 }]
		expect(stageRoadPositions([], stages)).toEqual([0])
		expect(stageRoadPositions([{ x: 1, z: 1 }], stages)).toEqual([0])
		expect(
			stageRoadPositions(
				[
					{ x: 1, z: 1 },
					{ x: 1, z: 1 },
				],
				stages,
			),
		).toEqual([0])
	})

	it('вырожденный отрезок внутри дороги не ломает расчёт', () => {
		const road = [
			{ x: 0, z: 0 },
			{ x: 0, z: 0 },
			{ x: 0, z: 4 },
		]
		expect(stageRoadPositions(road, [{ x: 0, z: 2 }])).toEqual([0.5])
	})
})

describe('roadProgress', () => {
	const positions = [0.2, 0.5, 0.8]

	it('положение текущего этапа плюс доля пути до следующего', () => {
		expect(roadProgress(positions, 0, 0)).toBeCloseTo(0.2)
		expect(roadProgress(positions, 0, 0.5)).toBeCloseTo(0.35)
		expect(roadProgress(positions, 1, 1)).toBeCloseTo(0.8)
	})

	it('у последнего этапа путь идёт до конца дороги', () => {
		expect(roadProgress(positions, 2, 0.5)).toBeCloseTo(0.9)
		expect(roadProgress(positions, 2, 1)).toBe(1)
	})

	it('приводит индекс и долю к допустимым', () => {
		expect(roadProgress(positions, -3, 0)).toBeCloseTo(0.2)
		expect(roadProgress(positions, 9, 0)).toBeCloseTo(0.8)
		expect(roadProgress(positions, 0.9, 2)).toBeCloseTo(0.5)
		expect(roadProgress(positions, 0, NaN)).toBeCloseTo(0.2)
		expect(roadProgress(positions, 0, -1)).toBeCloseTo(0.2)
	})

	it('без этапов — 0', () => {
		expect(roadProgress([], 0, 0.5)).toBe(0)
	})
})

describe('samplePoint', () => {
	const table = createRoadTable(line)

	it('точка по доле длины и угол направления', () => {
		const start = samplePoint(line, table, 0)
		expect(start).toMatchObject({ x: 0, z: 0 })
		expect(start.angle).toBeCloseTo(0)
		const middle = samplePoint(line, table, 0.6)
		expect(middle.x).toBeCloseTo(1)
		expect(middle.z).toBeCloseTo(2)
		expect(middle.angle).toBeCloseTo(Math.PI / 2)
		expect(samplePoint(line, table, 1)).toMatchObject({ x: 3, z: 2 })
	})

	it('доля вне 0..1 и не число приводятся к краям', () => {
		expect(samplePoint(line, table, 5)).toMatchObject({ x: 3, z: 2 })
		expect(samplePoint(line, table, -5)).toMatchObject({ x: 0, z: 0 })
		expect(samplePoint(line, table, NaN)).toMatchObject({ x: 0, z: 0 })
	})

	it('пустая дорога, одна точка и нулевая длина', () => {
		expect(samplePoint([], createRoadTable([]), 0.5)).toEqual({ x: 0, z: 0, angle: 0 })
		const one = [{ x: 2, z: 3 }]
		expect(samplePoint(one, createRoadTable(one), 0.5)).toEqual({ x: 2, z: 3, angle: 0 })
		const same = [
			{ x: 2, z: 3 },
			{ x: 2, z: 3 },
		]
		expect(samplePoint(same, createRoadTable(same), 0.5)).toEqual({ x: 2, z: 3, angle: 0 })
	})

	it('вырожденный отрезок в середине не даёт NaN', () => {
		const road = [
			{ x: 0, z: 0 },
			{ x: 0, z: 0 },
			{ x: 0, z: 2 },
		]
		const sample = samplePoint(road, createRoadTable(road), 0)
		expect(Number.isFinite(sample.x)).toBe(true)
		expect(Number.isFinite(sample.angle)).toBe(true)
	})

	it('дорога, оканчивающаяся повторной точкой, на конце даёт последнюю точку', () => {
		const road = [
			{ x: 0, z: 0 },
			{ x: 0, z: 2 },
			{ x: 0, z: 2 },
		]
		expect(samplePoint(road, createRoadTable(road), 1)).toMatchObject({ x: 0, z: 2 })
	})
})

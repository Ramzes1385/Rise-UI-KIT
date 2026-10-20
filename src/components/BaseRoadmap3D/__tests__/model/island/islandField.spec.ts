import { createRoadLayout } from '../../../model/island/roadPath'
import {
	ISLAND_CAP,
	createIslandField,
	createRoadBuckets,
	createValueNoise,
	fieldAt,
	hashSeed,
	mulberry32,
	resolveSeed,
	roadDistance,
	segmentDistance,
} from '../../../model/island/islandField'

describe('mulberry32', () => {
	it('даёт одинаковую последовательность по зерну и числа в [0, 1)', () => {
		const a = mulberry32(42)
		const b = mulberry32(42)
		const values = Array.from({ length: 50 }, () => a())
		expect(values).toEqual(Array.from({ length: 50 }, () => b()))
		values.forEach(value => {
			expect(value).toBeGreaterThanOrEqual(0)
			expect(value).toBeLessThan(1)
		})
		expect(mulberry32(43)()).not.toBe(values[0])
	})
})

describe('hashSeed', () => {
	it('стабилен и зависит от текста, в том числе от символов вне BMP', () => {
		expect(hashSeed('Vue')).toBe(hashSeed('Vue'))
		expect(hashSeed('Vue')).not.toBe(hashSeed('Vue3'))
		expect(hashSeed('')).toBe(2166136261)
		expect(hashSeed('🚀')).not.toBe(hashSeed('🌍'))
	})
})

describe('resolveSeed', () => {
	it('число берёт как есть, строку хеширует, иначе хеш запасного текста', () => {
		expect(resolveSeed(7, 'x')).toBe(7)
		expect(resolveSeed(-1, 'x')).toBe(4294967295)
		expect(resolveSeed('abc', 'x')).toBe(hashSeed('abc'))
		expect(resolveSeed('', 'x')).toBe(hashSeed('x'))
		expect(resolveSeed(NaN, 'x')).toBe(hashSeed('x'))
		expect(resolveSeed(undefined, 'x')).toBe(hashSeed('x'))
		expect(resolveSeed(null, 'x')).toBe(hashSeed('x'))
	})
})

describe('createValueNoise', () => {
	it('значения в [0, 1], детерминирован и периодичен', () => {
		const noise = createValueNoise(mulberry32(5), 4)
		const again = createValueNoise(mulberry32(5), 4)
		for (let x = -9; x < 9; x += 1.37) {
			for (let z = -9; z < 9; z += 1.11) {
				const value = noise(x, z)
				expect(value).toBeGreaterThanOrEqual(-1e-9)
				expect(value).toBeLessThanOrEqual(1 + 1e-9)
				expect(value).toBe(again(x, z))
				expect(noise(x + 4, z - 4)).toBeCloseTo(value, 9)
			}
		}
	})
})

describe('segmentDistance', () => {
	const a = { x: 0, z: 0 }
	const b = { x: 4, z: 0 }

	it('расстояние до проекции, до концов и до вырожденного отрезка', () => {
		expect(segmentDistance({ x: 2, z: 3 }, a, b)).toBe(3)
		expect(segmentDistance({ x: -3, z: 4 }, a, b)).toBe(5)
		expect(segmentDistance({ x: 7, z: 4 }, a, b)).toBe(5)
		expect(segmentDistance({ x: 3, z: 4 }, a, a)).toBe(5)
	})
})

describe('roadDistance', () => {
	it('совпадает с полным перебором в пределах предела и не больше предела вдали', () => {
		const layout = createRoadLayout(6, 3)
		const origin = { x: -20, z: -12 }
		const buckets = createRoadBuckets(layout.road, origin)
		for (let x = -20; x < 20; x += 3.3) {
			for (let z = -12; z < 25; z += 2.9) {
				let brute: number = ISLAND_CAP
				for (let i = 0; i < layout.road.length - 1; i++) {
					brute = Math.min(brute, segmentDistance({ x, z }, layout.road[i], layout.road[i + 1]))
				}
				expect(roadDistance(buckets, { x, z })).toBeCloseTo(brute, 9)
			}
		}
		expect(roadDistance(buckets, { x: 500, z: 500 })).toBe(ISLAND_CAP)
	})
})

describe('createIslandField', () => {
	const layout = createRoadLayout(6, 3)

	it('для пустой дороги поле пустое', () => {
		const grid = createIslandField(createRoadLayout(0, 3), 1)
		expect(grid).toMatchObject({ width: 0, height: 0, x0: 0, z0: 0, cellSize: 0.5 })
		expect(grid.field).toHaveLength(0)
		expect(fieldAt(grid, 0, 0)).toBe(Infinity)
	})

	it('суша (< 0) на дороге и у пьедесталов, вода вдали, сетка 0,5', () => {
		const grid = createIslandField(layout, 11)
		expect(grid.cellSize).toBe(0.5)
		expect(grid.field).toHaveLength(grid.width * grid.height)
		layout.road.forEach(point => expect(fieldAt(grid, point.x, point.z)).toBeLessThan(-1))
		layout.stages.forEach(stage => expect(fieldAt(grid, stage.x, stage.z)).toBeLessThan(-2))
		expect(fieldAt(grid, grid.x0, grid.z0)).toBeGreaterThan(0)
	})

	it('зерно меняет берег, то же зерно даёт то же поле', () => {
		const first = createIslandField(layout, 11)
		expect([...createIslandField(layout, 11).field]).toEqual([...first.field])
		expect([...createIslandField(layout, 12).field]).not.toEqual([...first.field])
	})

	it('размер ячейки задаёт сетку', () => {
		const fine = createIslandField(layout, 11, 0.25)
		const base = createIslandField(layout, 11)
		expect(fine.width).toBeGreaterThan(base.width * 1.9)
	})
})

describe('fieldAt', () => {
	it('вне сетки — бесконечность', () => {
		const grid = createIslandField(createRoadLayout(2, 2), 3)
		expect(fieldAt(grid, grid.x0 - 5, grid.z0)).toBe(Infinity)
		expect(fieldAt(grid, grid.x0, grid.z0 - 5)).toBe(Infinity)
		expect(fieldAt(grid, grid.x0 + grid.width, grid.z0)).toBe(Infinity)
		expect(fieldAt(grid, grid.x0, grid.z0 + grid.height)).toBe(Infinity)
		expect(Number.isFinite(fieldAt(grid, grid.x0, grid.z0))).toBe(true)
	})
})

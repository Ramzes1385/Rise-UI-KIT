import { createRoadLayout } from '../../../model/island/roadPath'
import { createIslandField } from '../../../model/island/islandField'
import type { IslandField } from '../../../types/roadmap3dIsland.types'
import {
	ISLAND_TERRACE_LEVELS,
	contourArea,
	createShoreline,
	createTerraces,
	orientContour,
	simplifyContour,
	traceContour,
	traceContours,
} from '../../../model/island/islandContour'

function gridOf(width: number, height: number, value: (i: number, j: number) => number): IslandField {
	const field = new Float32Array(width * height)
	for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) field[j * width + i] = value(i, j)
	return { field, width, height, x0: 10, z0: -4, cellSize: 1 }
}

const circle = (cx: number, cz: number, r: number) => (i: number, j: number) => Math.hypot(i - cx, j - cz) - r

describe('contourArea / orientContour', () => {
	const square = [
		{ x: 0, z: 0 },
		{ x: 2, z: 0 },
		{ x: 2, z: 2 },
		{ x: 0, z: 2 },
	]

	it('площадь со знаком и ориентация к положительной', () => {
		expect(contourArea(square)).toBe(4)
		expect(contourArea([...square].reverse())).toBe(-4)
		expect(orientContour(square)).toBe(square)
		expect(orientContour([...square].reverse())).toEqual([...square].reverse().reverse())
		expect(contourArea(orientContour([...square].reverse()))).toBe(4)
	})
})

describe('traceContour', () => {
	it('круг на синтетической сетке — один замкнутый контур нужного радиуса', () => {
		const grid = gridOf(21, 21, circle(10, 10, 5))
		const loops = traceContours(grid)
		expect(loops).toHaveLength(1)
		const contour = traceContour(grid)
		expect(contour.length).toBeGreaterThan(25)
		contour.forEach(point => expect(Math.hypot(point.x - 20, point.z - 6)).toBeGreaterThan(4.9))
		contour.forEach(point => expect(Math.hypot(point.x - 20, point.z - 6)).toBeLessThan(5.1))
		expect(contourArea(contour)).toBeGreaterThan(70)
	})

	it('выбирает самый длинный из нескольких контуров', () => {
		const small = circle(4, 4, 2)
		const big = circle(15, 15, 5)
		const grid = gridOf(24, 24, (i, j) => Math.min(small(i, j), big(i, j)))
		expect(traceContours(grid)).toHaveLength(2)
		const contour = traceContour(grid)
		contour.forEach(point => expect(point.x).toBeGreaterThan(14))
	})

	it('уровень сдвигает контур внутрь', () => {
		const grid = gridOf(21, 21, circle(10, 10, 5))
		expect(contourArea(traceContour(grid, -2))).toBeLessThan(contourArea(traceContour(grid, 0)))
	})

	it('нет суши или пустая сетка — пусто', () => {
		expect(traceContour(gridOf(5, 5, () => 3))).toEqual([])
		expect(traceContour(gridOf(5, 5, () => -3))).toEqual([])
		expect(traceContours({ field: new Float32Array(0), width: 0, height: 0, x0: 0, z0: 0, cellSize: 1 })).toEqual([])
	})

	it('все 14 случаев ячейки дают отрезки на её границе, седла — два', () => {
		for (let code = 1; code < 15; code++) {
			const corners = [code & 1, (code >> 1) & 1, (code >> 2) & 1, (code >> 3) & 1]
			const grid = gridOf(2, 2, (i, j) => {
				const order = [corners[0], corners[1], corners[3], corners[2]]
				return order[j * 2 + i] ? -1 : 1
			})
			const loops = traceContours(grid)
			expect(loops).toHaveLength(code === 5 || code === 10 ? 2 : 1)
			loops.forEach(loop => {
				expect(loop).toHaveLength(2)
				loop.forEach(point => {
					expect(point.x).toBeGreaterThanOrEqual(10)
					expect(point.x).toBeLessThanOrEqual(11)
					expect(point.z).toBeGreaterThanOrEqual(-4)
					expect(point.z).toBeLessThanOrEqual(-3)
				})
			})
		}
	})

	it('точка на ребре — линейная интерполяция по значениям', () => {
		const grid = gridOf(2, 2, i => (i === 0 ? -1 : 3))
		const xs = traceContour(grid).map(point => point.x)
		xs.forEach(x => expect(x).toBeCloseTo(10.25))
	})
})

describe('simplifyContour', () => {
	const points = Array.from({ length: 7 }, (_, index) => ({ x: index, z: 0 }))

	it('оставляет каждую n-ю точку, n < 1 приводит к 1', () => {
		expect(simplifyContour(points, 3).map(p => p.x)).toEqual([0, 3, 6])
		expect(simplifyContour(points, 0)).toEqual(points)
		expect(simplifyContour(points, 2.9).map(p => p.x)).toEqual([0, 2, 4, 6])
		expect(simplifyContour(points)).toHaveLength(4)
	})
})

describe('берег и уступы острова', () => {
	const grid = createIslandField(createRoadLayout(6, 3), 77)

	it('берег — замкнутый контур, прореженный вдвое', () => {
		const full = traceContour(grid)
		const shore = createShoreline(grid)
		expect(shore.length).toBe(Math.ceil(full.length / 2))
		expect(contourArea(shore)).toBeGreaterThan(100)
		expect(createShoreline(grid, 1)).toEqual(full)
	})

	it('три уступа на уровнях -0,5 / -1,1 / -1,8, каждый уже предыдущего', () => {
		const terraces = createTerraces(grid)
		expect(terraces.map(t => t.level)).toEqual([...ISLAND_TERRACE_LEVELS])
		expect(ISLAND_TERRACE_LEVELS).toEqual([-0.5, -1.1, -1.8])
		const areas = [contourArea(createShoreline(grid)), ...terraces.map(t => contourArea(t.points))]
		areas.forEach((area, index) => {
			expect(area).toBeGreaterThan(0)
			if (index > 0) expect(area).toBeLessThan(areas[index - 1])
		})
	})

	it('пустая сетка — пустые контуры', () => {
		const empty = createIslandField(createRoadLayout(0, 3), 1)
		expect(createShoreline(empty)).toEqual([])
		expect(createTerraces(empty).every(t => t.points.length === 0)).toBe(true)
	})
})

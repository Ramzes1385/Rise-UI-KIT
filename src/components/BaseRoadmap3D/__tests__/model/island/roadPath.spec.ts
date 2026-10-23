import { segmentDistance } from '../../../model/island/islandField'
import type { IslandPoint } from '../../../types/roadmap3dIsland.types'
import {
	ROAD_MAX_PER_ROW,
	ROAD_MIN_PER_ROW,
	ROAD_ROW_GAP,
	ROAD_STAGE_GAP,
	ROAD_STAGE_OFFSET,
	clampPerRow,
	createRoadLayout,
	rowDirection,
	smoothPath,
	stagePosition,
} from '../../../model/island/roadPath'

function distanceToRoad(road: IslandPoint[], point: IslandPoint): number {
	let best = Infinity
	for (let index = 0; index < road.length - 1; index++) best = Math.min(best, segmentDistance(point, road[index], road[index + 1]))
	return best
}

describe('clampPerRow', () => {
	it('держит число этапов в ряду в пределах 2-4 и округляет', () => {
		expect(clampPerRow(1)).toBe(ROAD_MIN_PER_ROW)
		expect(clampPerRow(9)).toBe(ROAD_MAX_PER_ROW)
		expect(clampPerRow(2.6)).toBe(3)
		expect(clampPerRow(4)).toBe(4)
	})

	it('для не числа берёт 3', () => {
		expect(clampPerRow(NaN)).toBe(3)
		expect(clampPerRow(Infinity)).toBe(3)
	})
})

describe('rowDirection', () => {
	it('ряды чередуют направление', () => {
		expect([0, 1, 2, 3].map(rowDirection)).toEqual([1, -1, 1, -1])
	})
})

describe('stagePosition', () => {
	it('первый ряд идёт вправо, второй влево, ряды разнесены по z', () => {
		const xs = [0, 1, 2, 3, 4, 5].map(index => stagePosition(index, 3).x)
		expect(xs).toEqual([-ROAD_STAGE_GAP, 0, ROAD_STAGE_GAP, ROAD_STAGE_GAP, 0, -ROAD_STAGE_GAP])
		expect(stagePosition(3, 3).z).toBe(ROAD_ROW_GAP)
		expect(stagePosition(0, 3).z).toBe(0)
	})
})

describe('smoothPath', () => {
	it('меньше двух точек возвращает копию', () => {
		const single = [{ x: 1, z: 2 }]
		const copy = smoothPath(single)
		expect(copy).toEqual(single)
		expect(copy[0]).not.toBe(single[0])
		expect(smoothPath([])).toEqual([])
	})

	it('ставит segments точек на отрезок и последнюю точку без изменений', () => {
		const points = [
			{ x: 0, z: 0 },
			{ x: 4, z: 0 },
			{ x: 4, z: 4 },
		]
		const path = smoothPath(points, 5)
		expect(path).toHaveLength(11)
		expect(path[0]).toEqual({ x: 0, z: 0 })
		expect(path[5].x).toBeCloseTo(4)
		expect(path[10]).toEqual({ x: 4, z: 4 })
	})
})

describe('createRoadLayout', () => {
	it('пустой путь — без этапов, дороги и цели вне начала', () => {
		expect(createRoadLayout(0, 3)).toEqual({ stages: [], road: [], goal: { x: 0, z: 0 } })
		expect(createRoadLayout(-4, 3).stages).toEqual([])
		expect(createRoadLayout(NaN, 3).road).toEqual([])
	})

	it.each([1, 2, 6, 12, 24])('%i этапов: дорога проходит у каждого пьедестала и заканчивается у цели', count => {
		for (const perRow of [2, 3, 4]) {
			const layout = createRoadLayout(count, perRow)
			expect(layout.stages).toHaveLength(count)
			layout.stages.forEach(stage => {
				expect(distanceToRoad(layout.road, { x: stage.x, z: stage.z + ROAD_STAGE_OFFSET })).toBeLessThan(1e-6)
			})
			const last = layout.stages[count - 1]
			const end = layout.road[layout.road.length - 1]
			expect(Math.abs(layout.goal.x - last.x)).toBeGreaterThan(Math.abs(end.x - last.x))
			expect(layout.goal.z).toBe(last.z)
			expect(layout.road[0].x).toBeLessThan(layout.stages[0].x)
		}
	})

	it('число в ряду приводится к 2-4', () => {
		expect(createRoadLayout(6, 1)).toEqual(createRoadLayout(6, 2))
		expect(createRoadLayout(6, 9)).toEqual(createRoadLayout(6, 4))
		expect(createRoadLayout(6, NaN)).toEqual(createRoadLayout(6, 3))
	})

	it('на границе ряда дорога делает поворот к следующему ряду', () => {
		const layout = createRoadLayout(6, 3)
		const turn = { x: layout.stages[2].x + ROAD_STAGE_GAP * 0.85, z: layout.stages[2].z + ROAD_ROW_GAP / 2 }
		expect(distanceToRoad(layout.road, turn)).toBeLessThan(1e-6)
	})
})

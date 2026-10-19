import { edge } from '../helpers/flowFixtures.test-utils'
import type { FlowRoute } from '../../types/api/flowLayout.types'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowTraffic } from '../../types/data/flowData.types'
import { collectLanes } from '../../model/scenario/particles/particleLanes'
import { cachedRouteTable } from '../../model/scenario/particles/routeSampler'
import { particleDistance, planParticles } from '../../model/scenario/particles/particleTicker'
import type { FlowParticleDirection, FlowParticleLane } from '../../types/internal/flowParticles.types'

guardConsole()

function lane(extra: Partial<FlowParticleLane> & { length?: number } = {}): FlowParticleLane {
	const { length = 240, ...rest } = extra
	const table = cachedRouteTable([
		{ x: 0, y: 0 },
		{ x: length, y: 0 },
	])!
	return { id: 'l', table, rate: 1, speed: 120, direction: 'forward', isHot: false, ...rest }
}

describe('число точек связи', () => {
	const wanted = (extra: Parameters<typeof lane>[0]) => planParticles([lane(extra)], 1000).reduce((sum, slot) => sum + slot.count, 0)

	it('число точек = ставка × длина ÷ скорость, не меньше одной', () => {
		expect(wanted({})).toBe(2)
		expect(wanted({ length: 600 })).toBe(5)
		expect(wanted({ rate: 0.1 })).toBe(1)
	})

	it('не больше 24 на направление, при двух направлениях — вдвое', () => {
		expect(wanted({ length: 100000 })).toBe(24)
		expect(wanted({ length: 100000, direction: 'both' })).toBe(48)
		expect(wanted({ direction: 'both' })).toBe(4)
	})

	it('нулевая ставка или скорость — точек нет', () => {
		expect(wanted({ rate: 0 })).toBe(0)
		expect(wanted({ speed: 0 })).toBe(0)
		expect(wanted({ rate: -1 })).toBe(0)
	})
})

describe('planParticles', () => {
	const counts = (slots: ReturnType<typeof planParticles>) => slots.map(slot => [slot.lane.id, slot.count])

	it('в пределе — каждой связи сколько хочет; пустой ввод — пусто', () => {
		expect(counts(planParticles([lane({ id: 'a' }), lane({ id: 'b', length: 600 })], 100))).toEqual([
			['a', 2],
			['b', 5],
		])
		expect(planParticles([], 100)).toEqual([])
	})

	it('сверх предела все сжимаются пропорционально, итог не больше предела', () => {
		const lanes = [lane({ id: 'a', length: 1200 }), lane({ id: 'b', length: 1200 })]
		const plan = planParticles(lanes, 10)
		expect(counts(plan)).toEqual([
			['a', 5],
			['b', 5],
		])
		expect(plan.reduce((sum, slot) => sum + slot.count, 0)).toBeLessThanOrEqual(10)
	})

	it('подсвеченные связи берут предел первыми, остальным достаётся остаток', () => {
		const lanes = [lane({ id: 'cold', length: 1200 }), lane({ id: 'hot', length: 1200, isHot: true })]
		expect(counts(planParticles(lanes, 10))).toEqual([['hot', 10]])
		expect(counts(planParticles(lanes, 14))).toEqual([
			['cold', 4],
			['hot', 10],
		])
	})

	it('предел 0 — точек нет; связи без точек отбрасываются', () => {
		expect(planParticles([lane()], 0)).toEqual([])
		expect(planParticles([lane({ rate: 0 })], 10)).toEqual([])
	})

	it('300 связей по 24 точки укладываются в предел 400', () => {
		const lanes = Array.from({ length: 300 }, (_, index) => lane({ id: `l${index}`, length: 100000 }))
		const total = planParticles(lanes, 400).reduce((sum, slot) => sum + slot.count, 0)
		expect(total).toBeLessThanOrEqual(400)
		expect(planParticles(lanes, 400)).toHaveLength(300)
	})
})

describe('particleDistance', () => {
	const slot = (direction: FlowParticleDirection, count = 4) => ({ lane: lane({ direction, length: 100, speed: 10 }), count })

	it('вперёд: точки равномерно разнесены по длине и сдвигаются со временем', () => {
		expect([0, 1, 2, 3].map(index => particleDistance(slot('forward'), index, 0))).toEqual([0, 25, 50, 75])
		expect(particleDistance(slot('forward'), 0, 3)).toBe(30)
	})

	it('круг по длине: после конца точка возвращается в начало', () => {
		expect(particleDistance(slot('forward'), 0, 11)).toBe(10)
		expect(particleDistance(slot('forward'), 3, 3)).toBe(5)
	})

	it('назад: отсчёт от конца', () => {
		expect(particleDistance(slot('reverse'), 0, 0)).toBe(100)
		expect(particleDistance(slot('reverse'), 1, 0)).toBe(75)
		expect(particleDistance(slot('reverse'), 0, 3)).toBe(70)
	})

	it('в обе стороны: чётные идут вперёд, нечётные — назад', () => {
		expect(particleDistance(slot('both'), 0, 0)).toBe(0)
		expect(particleDistance(slot('both'), 1, 0)).toBe(75)
		expect(particleDistance(slot('both'), 2, 0)).toBe(50)
	})

	it('отрицательное время не даёт отрицательного расстояния', () => {
		expect(particleDistance(slot('forward'), 0, -3)).toBe(70)
	})
})

describe('collectLanes', () => {
	const routeOf = (id: string): FlowRoute => ({
		path: 'M0 0',
		points: [
			{ x: 0, y: 0 },
			{ x: 240, y: 0 },
		],
		label: null,
		...{ id },
	})
	const edges = ['a', 'b', 'c', 'd', 'e', 'f'].map(id => edge(id, 'x', 'y'))
	const routes = Object.fromEntries(['a', 'b', 'c', 'd', 'f'].map(id => [id, routeOf(id)]))
	const traffic: Record<string, FlowTraffic | undefined> = {
		a: { rate: 1 },
		b: { rate: 0 },
		c: { rate: 0.5, speed: 40, isReversed: true },
		d: { rate: 2, isBidirectional: true, isReversed: true },
		e: { rate: 1 },
		f: undefined,
	}

	it('лежит ли связь в трафике: ставка больше нуля, есть маршрут', () => {
		const lanes = collectLanes({ edges, routes, trafficOf: item => traffic[item.id], hot: new Set() })
		expect(lanes.map(item => item.id)).toEqual(['a', 'c', 'd'])
	})

	it('скорость по умолчанию 120; направление: прямое, обратное, в обе стороны (оно главнее обратного)', () => {
		const lanes = collectLanes({ edges, routes, trafficOf: item => traffic[item.id], hot: new Set() })
		expect(lanes.map(item => [item.speed, item.direction, item.rate])).toEqual([
			[120, 'forward', 1],
			[40, 'reverse', 0.5],
			[120, 'both', 2],
		])
	})

	it('подсвеченная связь помечается, таблица маршрута берётся из кэша', () => {
		const first = collectLanes({ edges, routes, trafficOf: item => traffic[item.id], hot: new Set(['c']) })
		const second = collectLanes({ edges, routes, trafficOf: item => traffic[item.id], hot: new Set() })
		expect(first.map(item => item.isHot)).toEqual([false, true, false])
		expect(first[0].table).toBe(second[0].table)
	})

	it('ставка не задана — трафика нет; маршрут без длины — связи нет', () => {
		const flat = { ...routes, a: { ...routeOf('a'), points: [{ x: 1, y: 1 }] } }
		const lanes = collectLanes({
			edges: edges.slice(0, 3),
			routes: flat,
			trafficOf: item => (item.id === 'c' ? {} : traffic[item.id]),
			hot: new Set(),
		})
		expect(lanes).toEqual([])
	})
})

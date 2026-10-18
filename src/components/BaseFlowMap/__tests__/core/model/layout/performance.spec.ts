import { createRandom, randomInt } from '../fixtures/seeded'
import { edge, group, map, node } from '../fixtures/flowData'
import { createScope, hasOverlaps } from '../fixtures/layoutScope'
import { computeRoutes } from '../../../../model/layout/flowRoutes'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import { createLayoutInput } from '../../../../model/layout/flowLayoutInput'

const COUNT = 300

function bigMap() {
	const random = createRandom(2026)
	const groups = Array.from({ length: 6 }, (_, index) => group(`g${index}`, { kind: 'layer' }))
	const nodes = Array.from({ length: COUNT }, (_, index) => node(`n${index}`, { group: `g${index % 6}` }))
	const edges = Array.from({ length: COUNT * 2 }, (_, index) => {
		const from = randomInt(random, COUNT - 1)
		const to = from + 1 + randomInt(random, Math.min(12, COUNT - from - 1))
		return edge(`e${index}`, [`n${from}`, `n${to}`])
	})
	return map({ nodes, edges, groups })
}

function median(values: number[]): number {
	return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
}

describe('производительность: 300 узлов', () => {
	it('раскладка 300 узлов укладывается в бюджет, узлы не пересекаются', () => {
		const scope = createScope(bigMap(), { layout: { direction: 'LR' } })
		runFlowLayout(scope)
		const times = Array.from({ length: 5 }, () => {
			const start = performance.now()
			runFlowLayout(scope)
			return performance.now() - start
		})
		expect(median(times)).toBeLessThan(500)
		const { nodes } = runFlowLayout(scope)
		expect(Object.keys(nodes)).toHaveLength(COUNT)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('маршруты 600 связей строятся без зависаний', () => {
		const scope = createScope(bigMap(), { layout: { direction: 'LR', routing: 'orthogonal' } })
		const layout = runFlowLayout(scope)
		const start = performance.now()
		const routes = computeRoutes(scope, layout, createLayoutInput(scope).edges)
		expect(performance.now() - start).toBeLessThan(2000)
		expect(Object.keys(routes)).toHaveLength(COUNT * 2)
	})

	it('раскладка 300 узлов детерминирована', () => {
		const scope = createScope(bigMap(), { layout: { direction: 'TB' } })
		expect(runFlowLayout(scope)).toEqual(runFlowLayout(scope))
	})
})

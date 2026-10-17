import { act } from '../helpers/flowFixtures.test-utils'
import { buildTimeline } from '../../model/scenario/timeline'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowScenario } from '../../types/data/flowScenario.types'

function scenario(extra: Partial<FlowScenario>): FlowScenario {
	return { id: 's', label: 'Сценарий', steps: [], ...extra }
}

guardConsole()

describe('buildTimeline', () => {
	it('uniform: шаги идут подряд по 1200 мс, пустой сценарий — нулевая длительность', () => {
		const result = buildTimeline(scenario({ steps: [act('a'), act('b')] }), {})
		expect(result.entries.map(entry => [entry.step, entry.start, entry.duration])).toEqual([
			['a', 0, 1200],
			['b', 1200, 1200],
		])
		expect(result.duration).toBe(2400)
		expect(buildTimeline(scenario({}), {})).toEqual({ entries: [], duration: 0 })
	})

	it('uniform: stepDuration сценария зажимается в пределах minStep и maxStep, мусор заменяется умолчанием', () => {
		const steps = [act('a')]
		expect(buildTimeline(scenario({ steps, stepDuration: 5000 }), {}).duration).toBe(2400)
		expect(buildTimeline(scenario({ steps, stepDuration: 100 }), {}).duration).toBe(600)
		expect(buildTimeline(scenario({ steps, stepDuration: 900 }), {}).duration).toBe(900)
		expect(buildTimeline(scenario({ steps, stepDuration: -5 }), {}).duration).toBe(1200)
		expect(buildTimeline(scenario({ steps, stepDuration: Number.NaN }), {}).duration).toBe(1200)
		expect(buildTimeline(scenario({ steps, stepDuration: 5000, maxStep: 8000 }), {}).duration).toBe(5000)
		expect(buildTimeline(scenario({ steps, stepDuration: 100, minStep: 50 }), {}).duration).toBe(100)
	})

	it('duration шага важнее хронометража; нулевая, отрицательная и нечисловая игнорируются', () => {
		const steps = [
			act('a', { duration: 300 }),
			act('b', { duration: 0 }),
			act('c', { duration: -1 }),
			act('d', { duration: Number.NaN }),
		]
		expect(buildTimeline(scenario({ steps }), {}).entries.map(entry => entry.duration)).toEqual([300, 1200, 1200, 1200])
	})

	it('latency: длительность пропорциональна задержке в пределах minStep..maxStep', () => {
		const steps = [act('a', { latency: 10 }), act('b', { latency: 20 }), act('c', { latency: 40 }), act('d')]
		const result = buildTimeline(scenario({ steps, timing: 'latency' }), {})
		expect(result.entries.map(entry => entry.duration)).toEqual([1050, 1500, 2400, 1200])
	})

	it('latency: свои пределы; шаг без задержки и сценарий без задержек идут как uniform', () => {
		const steps = [act('a', { latency: 5 }), act('b', { latency: 10 })]
		const custom = buildTimeline(scenario({ steps, timing: 'latency', minStep: 100, maxStep: 500 }), {})
		expect(custom.entries.map(entry => entry.duration)).toEqual([300, 500])
		const none = buildTimeline(scenario({ steps: [act('a'), act('b')], timing: 'latency' }), {})
		expect(none.entries.map(entry => entry.duration)).toEqual([1200, 1200])
	})

	it('latency: задержки внутри параллельных веток и выбранных ветвлений тоже считаются при поиске максимума', () => {
		const steps = [
			act('a', { latency: 10 }),
			{ type: 'parallel' as const, id: 'p', branches: [[act('b', { latency: 100 })]] },
			{ type: 'choice' as const, id: 'c', branches: [{ id: 'x', steps: [act('d', { latency: 50 })] }] },
		]
		const result = buildTimeline(scenario({ steps, timing: 'latency' }), {})
		expect(result.entries.map(entry => [entry.step, entry.duration])).toEqual([
			['a', 780],
			['b', 2400],
			['d', 1500],
		])
	})

	it('параллельные ветки стартуют вместе, следующий шаг ждёт самую длинную', () => {
		const steps = [
			{
				type: 'parallel' as const,
				id: 'p',
				branches: [[act('a', { duration: 500 })], [act('b', { duration: 400 }), act('c', { duration: 700 })]],
			},
			act('after', { duration: 100 }),
		]
		const result = buildTimeline(scenario({ steps }), {})
		expect(result.entries.map(entry => [entry.step, entry.start, entry.branch])).toEqual([
			['a', 0, 'p:0'],
			['b', 0, 'p:1'],
			['c', 400, 'p:1'],
			['after', 1100, undefined],
		])
		expect(result.duration).toBe(1200)
	})

	it('пустая параллель не сдвигает время', () => {
		const result = buildTimeline(scenario({ steps: [{ type: 'parallel', id: 'p', branches: [] }, act('a')] }), {})
		expect(result.entries[0].start).toBe(0)
	})

	it('ветвление: идёт выбранная в choices ветка по id или условию, иначе defaultBranch, иначе первая', () => {
		const choice = {
			type: 'choice' as const,
			id: 'pay',
			branches: [
				{ id: 'ok', condition: 'прошла', steps: [act('ship', { duration: 100 })] },
				{ id: 'fail', condition: 'отказ', steps: [act('cancel', { duration: 200 })] },
			],
		}
		const steps = [choice, act('end', { duration: 50 })]
		const base = scenario({ steps })
		expect(buildTimeline(base, { pay: 'fail' }).entries.map(entry => entry.step)).toEqual(['cancel', 'end'])
		expect(buildTimeline(base, { pay: 'отказ' }).entries[0].branch).toBe('fail')
		expect(buildTimeline(base, {}).entries.map(entry => entry.step)).toEqual(['ship', 'end'])
		const withDefault = scenario({ steps: [{ ...choice, defaultBranch: 'fail' }] })
		expect(buildTimeline(withDefault, {}).entries[0].step).toBe('cancel')
		expect(buildTimeline(withDefault, { pay: 'нет такой' }).entries[0].step).toBe('cancel')
	})

	it('ветвление без веток пропускается', () => {
		const result = buildTimeline(scenario({ steps: [{ type: 'choice', id: 'c', branches: [] }, act('a')] }), {})
		expect(result.entries.map(entry => [entry.step, entry.start])).toEqual([['a', 0]])
	})

	it('эффект: из шага, из нотации, иначе travel у связи и pulse у узла', () => {
		const steps = [act('a', { effect: 'draw', edge: 'e' }), act('b', { edge: 'e' }), act('c', { node: 'n' }), act('d', { edge: 'e' })]
		const effectOf = (action: { id: string }) => (action.id === 'b' ? ('draw' as const) : undefined)
		const result = buildTimeline(scenario({ steps }), {}, { effectOf })
		expect(result.entries.map(entry => entry.effect)).toEqual(['draw', 'draw', 'pulse', 'travel'])
		expect(result.entries[0]).toMatchObject({ edge: 'e', node: undefined })
		expect(result.entries[2]).toMatchObject({ node: 'n' })
	})

	it('записи упорядочены по началу, при равенстве — по порядку обхода', () => {
		const steps = [{ type: 'parallel' as const, id: 'p', branches: [[act('x', { duration: 300 }), act('y')], [act('z')]] }]
		const starts = buildTimeline(scenario({ steps }), {}).entries.map(entry => [entry.step, entry.start])
		expect(starts).toEqual([
			['x', 0],
			['z', 0],
			['y', 300],
		])
	})
})

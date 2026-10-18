import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowTimelineEntry } from '../../types/data/flowScenario.types'
import { act, edge, graphOf, node } from '../helpers/flowFixtures.test-utils'
import { nextSpeed, panelSteps, totalLatency } from '../../model/scenario/panel/panelSteps'

guardConsole()

const graph = graphOf([node('web'), node('api')], [edge('call', 'web', 'api')])

function entry(step: string, extra: Partial<FlowTimelineEntry> = {}): FlowTimelineEntry {
	return { step, start: 0, duration: 1000, effect: 'travel', ...extra }
}

describe('panelSteps', () => {
	const actions = new Map([
		['a', act('a', { edge: 'call', label: 'POST', via: 'HTTPS', latency: 18 })],
		['b', act('b', { edge: 'call', status: 'error' })],
		['c', act('c', { node: 'api', status: 'down' })],
		['d', act('d', { node: 'api', status: 'ok' })],
	])
	const timeline = [entry('a'), entry('b', { branch: 'p:0' }), entry('c', { branch: 'ok' }), entry('d'), entry('unknown')]

	it('строка на шаг: номер, заголовок, подробности, задержка, начало', () => {
		const steps = panelSteps({ timeline, actions, graph, state: { activeSteps: [], doneSteps: [] } })
		expect(steps[0]).toMatchObject({
			id: 'a',
			number: 1,
			title: 'WEB → API',
			detail: 'POST · HTTPS',
			latency: `18 ${UI_FLOW_SCENARIO.UNIT_MS}`,
			start: 0,
		})
		expect(steps.map(step => step.number)).toEqual([1, 2, 3, 4, 5])
	})

	it('неизвестный шаг подписан своим id', () => {
		const steps = panelSteps({ timeline, actions, graph, state: { activeSteps: [], doneSteps: [] } })
		expect(steps[4]).toMatchObject({ title: 'unknown', detail: '', latency: '' })
	})

	it('текущие и пройденные берутся из состояния', () => {
		const steps = panelSteps({ timeline, actions, graph, state: { activeSteps: ['b'], doneSteps: ['a'] } })
		expect(steps.map(step => [step.isCurrent, step.isDone])).toEqual([
			[false, true],
			[true, false],
			[false, false],
			[false, false],
			[false, false],
		])
	})

	it('ошибкой считаются статусы error и down; параллельной — ветка с двоеточием', () => {
		const steps = panelSteps({ timeline, actions, graph, state: { activeSteps: [], doneSteps: [] } })
		expect(steps.map(step => step.isFailed)).toEqual([false, true, true, false, false])
		expect(steps.map(step => step.isParallel)).toEqual([false, true, false, false, false])
	})
})

describe('totalLatency', () => {
	it('складывает задержки шагов хронометража', () => {
		const actions = new Map([
			['a', act('a', { latency: 400 })],
			['b', act('b', { latency: 600 })],
			['c', act('c', { latency: 5000 })],
		])
		expect(totalLatency([entry('a'), entry('b')], actions)).toBe(`1 ${UI_FLOW_SCENARIO.UNIT_S}`)
	})

	it('шаги без задержки и неизвестные не считаются; нет задержек — пустая строка', () => {
		const actions = new Map([['a', act('a')]])
		expect(totalLatency([entry('a'), entry('x')], actions)).toBe('')
		expect(totalLatency([], actions)).toBe('')
	})
})

describe('nextSpeed', () => {
	it('кружит 0,5 → 1 → 2 → 0,5', () => {
		expect(nextSpeed(0.5)).toBe(1)
		expect(nextSpeed(1)).toBe(2)
		expect(nextSpeed(2)).toBe(0.5)
	})

	it('нестандартная скорость переходит на 0,5', () => {
		expect(nextSpeed(3)).toBe(0.5)
		expect(nextSpeed(4)).toBe(0.5)
	})
})

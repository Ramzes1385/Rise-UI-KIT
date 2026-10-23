import { UI_FLOW_BPMN } from '@/locales/messages'
import { buildFlowGraph } from '../../model/data/flowGraph'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { edge, mapOf, node } from '../helpers/flowFixtures.test-utils'
import { BPMN_GATEWAYS, simulateBpmn } from '../../model/notations/bpmn/bpmnSimulate'
import type { FlowScenario, FlowScenarioAction, FlowScenarioParallel } from '../../types/data/flowScenario.types'

guardConsole()

type Parts = Parameters<typeof mapOf>[0]

function run(parts: Parts, choices: Record<string, string> = {}): FlowScenario | null {
	return simulateBpmn(buildFlowGraph(mapOf(parts)), choices)
}

function rounds(scenario: FlowScenario | null): string[][] {
	return (scenario?.steps ?? []).map(step =>
		step.type === 'parallel'
			? (step as FlowScenarioParallel).branches.flat().map(item => (item as FlowScenarioAction).edge ?? '')
			: [(step as FlowScenarioAction).edge ?? ''],
	)
}

const refund: Parts = {
	nodes: [
		node('s', 'start'),
		node('check', 'task'),
		node('x', 'exclusive'),
		node('pay', 'task'),
		node('deny', 'task'),
		node('ok', 'end'),
		node('no', 'end'),
	],
	edges: [
		edge('e1', 's', 'check'),
		edge('e2', 'check', 'x'),
		edge('yes', 'x', 'pay', { condition: 'одобрено', label: 'да' }),
		edge('nope', 'x', 'deny', { condition: 'отказ', isDefault: true }),
		edge('e5', 'pay', 'ok'),
		edge('e6', 'deny', 'no'),
	],
}

describe('simulateBpmn', () => {
	it('сценарий называется по словарю, шаги нумеруются, подпись шага — подпись связи или узла', () => {
		const scenario = run(refund)
		expect(scenario).toMatchObject({ id: 'bpmn-simulation', label: UI_FLOW_BPMN.SIMULATION })
		expect(scenario?.steps[0]).toMatchObject({ id: 'bpmn-simulation-1', edge: 'e1', label: 'CHECK' })
	})

	it('исключающий шлюз: без выбора идёт поток по умолчанию, выбор по условию, подписи, id потока', () => {
		expect(rounds(run(refund))).toEqual([['e1'], ['e2'], ['nope'], ['e6']])
		expect(rounds(run(refund, { x: 'одобрено' }))).toEqual([['e1'], ['e2'], ['yes'], ['e5']])
		expect(rounds(run(refund, { x: 'да' }))).toEqual([['e1'], ['e2'], ['yes'], ['e5']])
		expect(rounds(run(refund, { x: 'pay' }))).toEqual([['e1'], ['e2'], ['yes'], ['e5']])
	})

	it('параллельный шлюз: ветки идут одновременно, слияние ждёт обе и идёт дальше один раз', () => {
		const scenario = run({
			nodes: [
				node('s', 'start'),
				node('f', 'parallel'),
				node('a', 'task'),
				node('b', 'task'),
				node('j', 'parallel'),
				node('e', 'end'),
			],
			edges: [
				edge('1', 's', 'f'),
				edge('2', 'f', 'a'),
				edge('3', 'f', 'b'),
				edge('4', 'a', 'j'),
				edge('5', 'b', 'j'),
				edge('6', 'j', 'e'),
			],
		})
		expect(rounds(scenario)).toEqual([['1'], ['2', '3'], ['4', '5'], ['6']])
		expect(scenario?.steps[1]).toMatchObject({ type: 'parallel' })
	})

	it('включающий шлюз: идут потоки с условием, кроме потока по умолчанию; выбор перечнем', () => {
		const parts: Parts = {
			nodes: [node('s', 'start'), node('g', 'inclusive'), node('a', 'task'), node('b', 'task'), node('c', 'task')],
			edges: [
				edge('1', 's', 'g'),
				edge('a', 'g', 'a', { condition: 'A' }),
				edge('b', 'g', 'b', { condition: 'B' }),
				edge('c', 'g', 'c', { isDefault: true }),
			],
		}
		expect(rounds(run(parts))).toEqual([['1'], ['a', 'b']])
		expect(rounds(run(parts, { g: 'B,c' }))).toEqual([['1'], ['b', 'c']])
	})

	it('потоки сообщений между пулами: токен доходит до начала второго пула и идёт по нему', () => {
		const scenario = run({
			nodes: [node('sa', 'start'), node('ta', 'task'), node('ea', 'end'), node('sb', 'start'), node('tb', 'task'), node('eb', 'end')],
			edges: [
				edge('1', 'sa', 'ta'),
				edge('2', 'ta', 'ea'),
				edge('m', 'ta', 'sb', { kind: 'message' }),
				edge('3', 'sb', 'tb'),
				edge('4', 'tb', 'eb'),
			],
		})
		expect(rounds(scenario)).toEqual([['1'], ['2', 'm'], ['3'], ['4']])
	})

	it('сообщение в задачу, у которой есть свой входной поток, показывается, но не запускает её второй раз', () => {
		const scenario = run({
			nodes: [node('sa', 'start'), node('ta', 'task'), node('sb', 'start'), node('tb', 'task'), node('after', 'end')],
			edges: [edge('1', 'sa', 'ta'), edge('2', 'sb', 'tb'), edge('m', 'ta', 'tb', { kind: 'message' }), edge('3', 'tb', 'after')],
		})
		const flat = rounds(scenario).flat()
		expect(flat.filter(id => id === '3')).toHaveLength(1)
		expect(flat).toContain('m')
	})

	it('ассоциации и данные не несут токен; начало процесса — только событие start без входящих потоков', () => {
		const scenario = run({
			nodes: [
				node('s', 'start'),
				node('t', 'task'),
				node('note', 'annotation'),
				node('d', 'data-object'),
				node('late', 'start'),
				node('x', 'task'),
			],
			edges: [
				edge('1', 's', 't'),
				edge('a', 't', 'note', { kind: 'association' }),
				edge('da', 'd', 't', { kind: 'data-association' }),
				edge('loop', 'x', 'late'),
				edge('2', 'late', 'x'),
			],
		})
		expect(rounds(scenario)).toEqual([['1']])
	})

	it('цикл возврата обрывается на пределе 200 шагов', () => {
		const scenario = run({
			nodes: [node('s', 'start'), node('a', 'task'), node('b', 'task')],
			edges: [edge('1', 's', 'a'), edge('2', 'a', 'b'), edge('3', 'b', 'a')],
		})
		expect(scenario?.steps).toHaveLength(200)
	})

	it('нет события start — сценария нет', () => {
		expect(run({ nodes: [node('a', 'task'), node('b', 'task')], edges: [edge('1', 'a', 'b')] })).toBeNull()
		expect(run({ nodes: [] })).toBeNull()
	})

	it('поведение шлюзов: параллельный делит и ждёт, исключающий выбирает, включающий и сложный — по условиям', () => {
		expect(BPMN_GATEWAYS).toEqual({
			parallel: { split: 'all', join: 'all' },
			exclusive: { split: 'one', join: 'one' },
			inclusive: { split: 'some', join: 'some' },
			'event-based': { split: 'one', join: 'one' },
			complex: { split: 'some', join: 'some' },
		})
	})
})

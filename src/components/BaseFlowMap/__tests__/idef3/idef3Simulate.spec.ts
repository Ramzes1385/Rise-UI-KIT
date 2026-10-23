import { UI_FLOW_IDEF } from '@/locales/messages'
import { edge, graphOf, node } from '../fixtures/idefData'
import { idef3Simulate } from '../../model/notations/idef3/idef3Simulate'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import type { FlowScenario, FlowScenarioStep } from '../../types/data/flowScenario.types'

const uob = (id: string, label = id): FlowNode => node(id, 'uob', label)
const junction = (id: string, kind: string): FlowNode => node(id, kind, '')

function simulate(nodes: FlowNode[], edges: FlowEdge[], choices = {}): FlowScenario | null {
	return idef3Simulate(graphOf(nodes, edges), choices)
}

function describeStep(step: FlowScenarioStep): string {
	if ('type' in step && step.type === 'parallel')
		return `[${step.branches.map(branch => branch.map(describeStep).join('+')).join(' | ')}]`
	if ('node' in step) return `n:${step.node}`
	return `e:${(step as { edge: string }).edge}`
}

function trace(scenario: FlowScenario | null): string[] {
	return (scenario?.steps ?? []).map(describeStep)
}

describe('IDEF3: обход токенами', () => {
	it('без стартовых узлов сценария нет', () => {
		expect(simulate([], [])).toBeNull()
		expect(simulate([uob('a')], [])).toBeNull()
		expect(simulate([uob('a'), uob('b')], [edge('e1', 'a>b'), edge('e2', 'b>a')])).toBeNull()
	})

	it('называет сценарий и нумерует шаги', () => {
		const scenario = simulate([uob('a'), uob('b')], [edge('e1', 'a>b')])
		expect(scenario).toMatchObject({ id: 'idef3-simulation', label: UI_FLOW_IDEF.SIMULATION })
		expect(scenario!.steps.map(step => step.id)).toEqual(['s1', 's2', 's3'])
	})

	it('цепочка UOB: пульс начала, бег по связи, пульс следующего', () => {
		const scenario = simulate([uob('a', 'Принять'), uob('b', 'Проверить')], [edge('e1', 'a>b', { label: 'заказ' })])
		expect(scenario!.steps).toEqual([
			{ id: 's1', node: 'a', label: 'Принять', effect: 'pulse' },
			{ id: 's2', edge: 'e1', label: 'заказ', effect: 'travel' },
			{ id: 's3', node: 'b', label: 'Проверить', effect: 'pulse' },
		])
	})

	it('подпись связи — условие, если подписи нет; пустая подпись узла не передаётся', () => {
		const scenario = simulate([uob('a', ''), uob('b', '')], [edge('e1', 'a>b', { condition: 'оплачен' })])
		expect(scenario!.steps).toEqual([
			{ id: 's1', node: 'a', label: undefined, effect: 'pulse' },
			{ id: 's2', edge: 'e1', label: 'оплачен', effect: 'travel' },
			{ id: 's3', node: 'b', label: undefined, effect: 'pulse' },
		])
	})

	it('связи отношения и узлы-ссылки в обход не входят', () => {
		const nodes = [uob('a'), uob('b'), node('r', 'referent', 'ссылка')]
		const scenario = simulate(nodes, [edge('e1', 'a>b'), edge('e2', 'a>r', { kind: 'relational' }), edge('e3', 'b>r')])
		expect(trace(scenario)).toEqual(['n:a', 'e:e1', 'n:b', 'e:e3'])
	})

	it('узел-ссылка не может быть стартом', () => {
		const nodes = [node('r', 'referent'), uob('b')]
		expect(simulate(nodes, [edge('e1', 'r>b')])).toBeNull()
	})

	it('поток объекта идёт как обычный шаг', () => {
		const scenario = simulate([uob('a'), uob('b')], [edge('e1', 'a>b', { kind: 'object-flow' })])
		expect(trace(scenario)).toEqual(['n:a', 'e:e1', 'n:b'])
	})

	describe('соединение «&» (все ветки, синхронизация)', () => {
		const nodes = [uob('a'), junction('split', 'junction-and'), uob('b'), uob('c'), junction('join', 'junction-and'), uob('d')]
		const edges = [
			edge('e1', 'a>split'),
			edge('e2', 'split>b'),
			edge('e3', 'split>c'),
			edge('e4', 'b>join'),
			edge('e5', 'c>join'),
			edge('e6', 'join>d'),
		]

		it('ветки идут параллельно, слияние ждёт обе', () => {
			expect(trace(simulate(nodes, edges))).toEqual([
				'n:a',
				'e:e1',
				'n:split',
				'[e:e2 | e:e3]',
				'[n:b | n:c]',
				'[e:e4 | e:e5]',
				'n:join',
				'e:e6',
				'n:d',
			])
		})

		it('параллельный шаг состоит из веток по одному шагу', () => {
			const parallel = simulate(nodes, edges)!.steps.find(step => 'type' in step && step.type === 'parallel')
			expect(parallel).toMatchObject({
				type: 'parallel',
				id: 'p6',
				branches: [[{ edge: 'e2', effect: 'travel' }], [{ edge: 'e3', effect: 'travel' }]],
			})
		})

		it('слияние срабатывает один раз, даже если токенов пришло больше', () => {
			const extra = [...edges, edge('e7', 'a>join')]
			const steps = trace(simulate(nodes, extra))
			expect(steps.filter(step => step === 'n:join')).toHaveLength(1)
		})

		it('слияние не срабатывает, пока не пришли все токены', () => {
			const onlyOne = [
				edge('e0', 'r>x'),
				edge('e1', 'a>split'),
				edge('e2', 'split>b'),
				edge('e4', 'b>join'),
				edge('e5', 'x>join'),
				edge('e6', 'join>d'),
			]
			const steps = trace(simulate([...nodes, uob('x'), node('r', 'referent')], onlyOne))
			expect(steps).not.toContain('n:join')
			expect(steps).not.toContain('n:d')
		})
	})

	describe('соединение «O» (одна или несколько веток)', () => {
		const nodes = [uob('a'), junction('split', 'junction-or'), uob('b'), uob('c'), junction('join', 'junction-or'), uob('d')]
		const edges = [
			edge('e1', 'a>split'),
			edge('e2', 'split>b'),
			edge('e3', 'split>c'),
			edge('e4', 'b>join'),
			edge('e5', 'c>join'),
			edge('e6', 'join>d'),
		]

		it('разветвляет по всем веткам, слияние срабатывает от первого пришедшего токена', () => {
			const steps = trace(simulate(nodes, edges))
			expect(steps.slice(0, 5)).toEqual(['n:a', 'e:e1', 'n:split', '[e:e2 | e:e3]', '[n:b | n:c]'])
			expect(steps.filter(step => step === 'n:join')).toHaveLength(1)
			expect(steps.at(-1)).toBe('n:d')
		})
	})

	describe('соединение «X» (ровно одна ветка)', () => {
		const nodes = [uob('a'), junction('x', 'junction-xor'), uob('b'), uob('c'), uob('d')]
		const edges = [edge('e1', 'a>x'), edge('e2', 'x>b'), edge('e3', 'x>c'), edge('e4', 'x>d', { isDefault: true })]

		it('берёт выбранную связь', () => {
			expect(trace(simulate(nodes, edges, { x: 'e3' }))).toEqual(['n:a', 'e:e1', 'n:x', 'e:e3', 'n:c'])
		})

		it('без выбора берёт связь по умолчанию', () => {
			expect(trace(simulate(nodes, edges))).toEqual(['n:a', 'e:e1', 'n:x', 'e:e4', 'n:d'])
		})

		it('выбор несуществующей связи заменяется умолчанием', () => {
			expect(trace(simulate(nodes, edges, { x: 'нет такой' }))).toEqual(['n:a', 'e:e1', 'n:x', 'e:e4', 'n:d'])
		})

		it('без выбора и без умолчания берёт первую связь', () => {
			const plain = [edge('e1', 'a>x'), edge('e2', 'x>b'), edge('e3', 'x>c')]
			expect(trace(simulate(nodes, plain))).toEqual(['n:a', 'e:e1', 'n:x', 'e:e2', 'n:b'])
		})

		it('соединение без исходящих связей завершает обход', () => {
			expect(trace(simulate([uob('a'), junction('x', 'junction-xor')], [edge('e1', 'a>x')]))).toEqual(['n:a', 'e:e1', 'n:x'])
		})
	})

	it('несколько стартовых узлов запускаются параллельно', () => {
		const nodes = [uob('a'), uob('b'), uob('c')]
		const scenario = simulate(nodes, [edge('e1', 'a>c'), edge('e2', 'b>c')])
		expect(trace(scenario).slice(0, 2)).toEqual(['[n:a | n:b]', '[e:e1 | e:e2]'])
	})

	it('UOB, принявший токены от двух веток без соединения, срабатывает один раз', () => {
		const nodes = [uob('a'), uob('b'), uob('c')]
		const steps = trace(simulate(nodes, [edge('e1', 'a>c'), edge('e2', 'b>c')]))
		expect(steps.filter(step => step === 'n:c')).toHaveLength(1)
	})

	it('связь на несуществующий узел пропускается', () => {
		expect(trace(simulate([uob('a')], [edge('e1', 'a>ghost')]))).toEqual(['n:a', 'e:e1'])
	})

	it('цикл не зацикливает обход: каждый узел срабатывает один раз', () => {
		const nodes = [uob('s'), uob('a'), uob('b')]
		const edges = [edge('e1', 's>a'), edge('e2', 'a>b'), edge('e3', 'b>a')]
		const steps = trace(simulate(nodes, edges))
		expect(steps.filter(step => step === 'n:a')).toHaveLength(1)
		expect(steps.filter(step => step === 'n:b')).toHaveLength(1)
	})

	it('очень длинная цепочка обрывается около 200 шагов', () => {
		const nodes = Array.from({ length: 150 }, (_, index) => uob(`u${index}`))
		const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, `${nodes[index]!.id}>${item.id}`))
		const scenario = simulate(nodes, edges)
		expect(scenario!.steps.length).toBeGreaterThanOrEqual(200)
		expect(scenario!.steps.length).toBeLessThan(204)
	})
})

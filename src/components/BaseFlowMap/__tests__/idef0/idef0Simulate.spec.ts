import { UI_FLOW_IDEF } from '@/locales/messages'
import { idef0Simulate } from '../../model/notations/idef0/idef0Simulate'
import { edge, fn, graphOf, idef0Diagram, boundary } from '../fixtures/idefData'

function run(nodes: ReturnType<typeof fn>[], edges: ReturnType<typeof edge>[]) {
	return idef0Simulate(graphOf(nodes, edges), {})
}

describe('IDEF0: прохождение по модели', () => {
	it('без функций сценария нет', () => {
		expect(run([], [])).toBeNull()
		expect(run([boundary('i', 'input')], [])).toBeNull()
	})

	it('идёт по функциям в порядке номеров, а не данных', () => {
		const scenario = run([fn('b', 'A2'), fn('a', 'A1'), fn('c', 'A10')], [])
		expect(scenario?.steps.map(step => ('node' in step ? step.node : null))).toEqual(['a', 'b', 'c'])
	})

	it('функция без номера идёт первой', () => {
		const scenario = run([fn('b', 'A2'), fn('x')], [])
		expect(scenario?.steps.map(step => ('node' in step ? step.node : null))).toEqual(['x', 'b'])
	})

	it('называет сценарий и нумерует шаги s1, s2…', () => {
		const scenario = run([fn('a', 'A1')], [])
		expect(scenario).toMatchObject({ id: 'idef0-simulation', label: UI_FLOW_IDEF.SIMULATION })
		expect(scenario?.steps).toEqual([{ id: 's1', node: 'a', label: 'a', effect: 'pulse' }])
	})

	it('для каждой функции: входящие стрелки, пульс функции, исходящие', () => {
		const { nodes, edges } = idef0Diagram()
		const scenario = idef0Simulate(graphOf(nodes, edges), {})
		const steps = scenario!.steps
		const order = steps.map(step => ('edge' in step ? `e:${step.edge}` : `n:${(step as { node: string }).node}`))
		expect(order).toEqual(['e:e-i1', 'e:e-c1', 'n:a1', 'e:e-12', 'e:e-c2', 'e:e-m1', 'n:a2', 'e:e-23', 'n:a3', 'e:e-o1'])
	})

	it('управление и механизм рисуются (draw), вход и выход бегут (travel)', () => {
		const { nodes, edges } = idef0Diagram()
		const steps = idef0Simulate(graphOf(nodes, edges), {})!.steps
		const effects = Object.fromEntries(
			steps.filter(step => 'edge' in step).map(step => [(step as { edge: string }).edge, (step as { effect: string }).effect]),
		)
		expect(effects).toMatchObject({ 'e-i1': 'travel', 'e-c1': 'draw', 'e-m1': 'draw', 'e-12': 'travel', 'e-c2': 'draw' })
	})

	it('подпись шага — подпись стрелки, иначе подпись узла-источника', () => {
		const { nodes, edges } = idef0Diagram()
		const steps = idef0Simulate(graphOf(nodes, edges), {})!.steps
		const byEdge = Object.fromEntries(
			steps.filter(step => 'edge' in step).map(step => [(step as { edge: string }).edge, (step as { label?: string }).label]),
		)
		expect(byEdge['e-12']).toBe('Заявка')
		expect(byEdge['e-i1']).toBe('i1')
	})

	it('стрелка с несуществующим источником получает шаг без подписи и не ломает обход', () => {
		const scenario = run([fn('a', 'A1')], [edge('e1', 'ghost>a')])
		expect(scenario?.steps[0]).toMatchObject({ edge: 'e1', label: undefined, effect: 'travel' })
	})

	it('стрелка в несуществующий узел — обычный выход, обход не ломается', () => {
		const scenario = run([fn('a', 'A1')], [edge('e1', 'a>ghost')])
		expect(scenario!.steps).toEqual([
			{ id: 's1', node: 'a', label: 'a', effect: 'pulse' },
			{ id: 's2', edge: 'e1', label: 'a', effect: 'travel' },
		])
	})

	it('стрелку между двумя функциями показывает один раз — у первой по номеру', () => {
		const scenario = run([fn('a', 'A1'), fn('b', 'A2')], [edge('e1', 'a>b')])
		const edgeSteps = scenario!.steps.filter(step => 'edge' in step)
		expect(edgeSteps).toHaveLength(1)
	})

	it('ограничивает сценарий 200 шагами', () => {
		const nodes = Array.from({ length: 120 }, (_, index) => fn(`f${index}`, `A${index + 1}`))
		const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, `${nodes[index]!.id}>${item.id}`))
		const scenario = run(nodes, edges)
		expect(scenario!.steps).toHaveLength(200)
		expect(scenario!.steps[199]!.id).toBe('s200')
	})
})

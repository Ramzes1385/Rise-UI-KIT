import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'

const data = map({ nodes: [node('a'), node('b')], edges: [edge('e1', ['a', 'b'])] })

describe('контроллер: команды правки грузятся лениво', () => {
	it('вызов не применяется синхронно: данные меняются, когда загружен код команд', async () => {
		const { controller } = createHarness(data)
		const pending = controller.addNode(node('c'))
		expect(controller.getData().nodes).toHaveLength(2)
		const result = await pending
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
	})

	it('параллельные вызовы до загрузки выполняются по очереди и все применяются', async () => {
		const { controller } = createHarness(data)
		const results = await Promise.all([
			controller.addNode(node('c')),
			controller.addNode(node('d')),
			controller.updateNode('a', { label: 'Альфа' }),
		])
		expect(results.map(item => item.isApplied)).toEqual([true, true, true])
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'c', 'd'])
		expect(controller.getData().nodes[0].label).toBe('Альфа')
	})

	it('все команды связей, групп и раскладки доступны сразу после создания контроллера', async () => {
		const { controller } = createHarness(data)
		expect((await controller.addEdge({ id: 'e2', source: 'b', target: 'a' })).isApplied).toBe(true)
		expect((await controller.connect('a', 'b', { id: 'e3' })).isApplied).toBe(true)
		expect((await controller.updateEdge('e2', { label: 'назад' })).isApplied).toBe(true)
		expect((await controller.addGroup({ id: 'g', kind: 'zone', label: 'Зона' })).isApplied).toBe(true)
		expect((await controller.updateGroup('g', { label: 'Ядро' })).isApplied).toBe(true)
		expect((await controller.move(['a'], { x: 10, y: 20 })).isApplied).toBe(true)
		expect(controller.getData().groups?.[0].label).toBe('Ядро')
		expect(typeof (await controller.layout()).isApplied).toBe('boolean')
		expect((await controller.remove(['e2'])).isApplied).toBe(true)
	})

	it('undo и redo до первой правки ничего не делают и не загружают код команд', async () => {
		const { controller, eventsOf, announced } = createHarness(data)
		const before = controller.getData()
		controller.undo()
		controller.redo()
		expect(controller.getHistory()).toMatchObject({ canUndo: false, canRedo: false })
		expect(eventsOf('history-change')).toHaveLength(0)
		expect(announced).toHaveLength(0)
		expect(controller.getData()).toEqual(before)
	})

	it('после правки undo и redo работают как раньше', async () => {
		const { controller } = createHarness(data)
		await controller.addNode(node('c'))
		controller.undo()
		expect(controller.getData().nodes).toHaveLength(2)
		controller.redo()
		expect(controller.getData().nodes).toHaveLength(3)
	})
})

describe('контроллер: importJson грузится лениво', () => {
	it('возвращает обещание с результатом; до ответа данные не тронуты, потом заменены одним шагом', async () => {
		const { controller } = createHarness(data)
		const incoming = map({ title: 'Новая', nodes: [node('x')], edges: [] })
		const pending = controller.importJson(JSON.stringify(incoming))
		expect(controller.getData().nodes).toHaveLength(2)
		const result = await pending
		expect(result.isApplied).toBe(true)
		expect(controller.getData().title).toBe('Новая')
		controller.undo()
		expect(controller.getData().nodes).toHaveLength(2)
	})
})

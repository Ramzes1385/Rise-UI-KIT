import { createHarness } from '../fixtures/modelHarness'
import { edge, group, map, node } from '../fixtures/flowData'

const services = map({
	nodes: [node('gw', { kind: 'gateway' }), node('api', { kind: 'service' }), node('db', { kind: 'database' })],
	edges: [edge('e1', ['gw', 'api'], { kind: 'call' })],
})

describe('команды правки', () => {
	it('updateNode: изменение поля и откат; неизвестный id — not-found', async () => {
		const { controller } = createHarness(services)
		const result = await controller.updateNode('api', { subtitle: 'v2' })
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes[1].subtitle).toBe('v2')
		controller.undo()
		expect('subtitle' in controller.getData().nodes[1]).toBe(false)
		const missing = await controller.updateNode('zzz', { subtitle: 'x' })
		expect(missing.reject).toMatchObject({ code: 'not-found' })
	})

	it('правки подписи подряд склеиваются в один шаг истории', async () => {
		const { controller, model } = createHarness(services)
		await controller.updateNode('api', { label: 'А' })
		await controller.updateNode('api', { label: 'Аб' })
		await controller.updateNode('api', { label: 'Абв' })
		expect(model.history.list()).toHaveLength(1)
		controller.undo()
		expect(controller.getData().nodes[1].label).toBe('api')
	})

	it('updateGroup и addGroup', async () => {
		const { controller } = createHarness(map({ nodes: [node('a')], groups: [group('g')] }))
		expect((await controller.addGroup(group('g2'))).isApplied).toBe(true)
		expect((await controller.addGroup(group('g2'))).reject?.code).toBe('duplicate-id')
		expect((await controller.updateGroup('g', { label: 'Новая' })).isApplied).toBe(true)
		expect(controller.getData().groups?.[0].label).toBe('Новая')
		expect((await controller.updateGroup('nope', { color: 'red' })).reject?.code).toBe('not-found')
	})

	it('connect создаёт связь с id и видом по умолчанию', async () => {
		const { controller } = createHarness(services)
		const result = await controller.connect('api', 'db')
		expect(result.isApplied).toBe(true)
		expect(controller.getData().edges[1]).toMatchObject({ id: 'e-5', source: 'api', target: 'db', kind: 'call' })
	})

	it('connect со своими полями', async () => {
		const { controller } = createHarness(services)
		await controller.connect('api', 'db', { id: 'mine', label: 'L', kind: 'data', sourcePort: 'out' })
		expect(controller.getData().edges[1]).toMatchObject({ id: 'mine', sourcePort: 'out', label: 'L', kind: 'data' })
	})

	it('connect к несуществующему узлу и повтор id связи отклоняются', async () => {
		const { controller } = createHarness(services)
		expect((await controller.connect('api', 'ghost')).reject?.code).toBe('not-found')
		expect((await controller.connect('ghost', 'api')).reject?.code).toBe('not-found')
		expect((await controller.addEdge(edge('e1', ['api', 'db']))).reject?.code).toBe('duplicate-id')
	})

	it('таблица связей: запрещённая пара видов отклоняется кодом connection-not-allowed', async () => {
		const { controller } = createHarness(map({ nodes: [node('q', { kind: 'queue' }), node('d', { kind: 'database' })] }))
		const result = await controller.connect('q', 'd', { kind: 'call' })
		expect(result.reject).toMatchObject({ by: 'rule', code: 'connection-not-allowed' })
	})

	it('updateEdge: подпись — одним шагом, связи — с проверкой правил, неизвестная — not-found', async () => {
		const { controller } = createHarness(services)
		expect((await controller.updateEdge('e1', { label: 'GET' })).isApplied).toBe(true)
		expect(controller.getData().edges[0].label).toBe('GET')
		expect((await controller.updateEdge('e1', { target: 'db' })).isApplied).toBe(true)
		expect((await controller.updateEdge('e1', { source: 'db', target: 'api' })).reject?.code).toBe('connection-not-allowed')
		expect((await controller.updateEdge('e1', { source: 'ghost' })).reject?.code).toBe('not-found')
		expect((await controller.updateEdge('nope', { color: 'red' } as never)).reject?.code).toBe('not-found')
		expect((await controller.updateEdge('e1', { routing: 'straight' })).isApplied).toBe(true)
	})
})

describe('удаление и перенос', () => {
	const data = map({
		groups: [group('outer'), group('inner', { parent: 'outer' })],
		nodes: [node('a', { group: 'inner' }), node('b'), node('c', { kind: 'database' })],
		edges: [edge('e1', ['a', 'b']), edge('e2', ['b', 'c']), edge('e3', ['c', 'c'])],
	})

	it('удаление узла убирает его связи; undo возвращает всё на свои места', async () => {
		const { controller } = createHarness(data)
		const result = await controller.remove(['b'])
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'c'])
		expect(controller.getData().edges.map(item => item.id)).toEqual(['e3'])
		controller.undo()
		expect(controller.getData().nodes).toEqual(data.nodes)
		expect(controller.getData().groups).toEqual(data.groups)
		expect(controller.getData().edges.map(item => item.id)).toEqual(['e1', 'e2', 'e3'])
	})

	it('удаление группы убирает вложенные группы, их узлы и связи узлов', async () => {
		const { controller } = createHarness(data)
		await controller.remove(['outer'])
		const after = controller.getData()
		expect(after.groups).toBeUndefined()
		expect(after.nodes.map(item => item.id)).toEqual(['b', 'c'])
		expect(after.edges.map(item => item.id)).toEqual(['e2', 'e3'])
	})

	it('удаление связи; неизвестные id — not-found', async () => {
		const { controller } = createHarness(data)
		expect((await controller.remove(['e1'])).isApplied).toBe(true)
		expect((await controller.remove(['zzz'])).reject?.code).toBe('not-found')
	})

	it('beforeDelete видит набор и может сузить его до связей', async () => {
		const { controller } = createHarness(data)
		const seen = vi.fn()
		controller.on('beforeDelete', ctx => {
			seen(
				ctx.nodes.map(item => item.id),
				ctx.edges.map(item => item.id),
			)
			return { nodes: [], edges: ctx.edges, groups: [] }
		})
		await controller.remove(['b'])
		expect(seen).toHaveBeenCalledWith(['b'], ['e2', 'e1'])
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
		expect(controller.getData().edges.map(item => item.id)).toEqual(['e3'])
	})

	it('если хук оставил бы висячие связи, удаление отклоняется кодом issues', async () => {
		const { controller } = createHarness(data)
		controller.on('beforeDelete', ctx => ({ nodes: ctx.nodes, edges: [], groups: [] }))
		const result = await controller.remove(['b'])
		expect(result.reject).toMatchObject({ by: 'limit', code: 'issues' })
		expect(controller.getData().nodes).toHaveLength(3)
	})

	it('move со смещением и с раздельными точками закрепляет узлы и шлёт node-move', async () => {
		const { controller, eventsOf } = createHarness(
			map({ nodes: [node('a', { position: { x: 10, y: 10 } }), node('b', { position: { x: 0, y: 0 } })] }),
		)
		await controller.move(['a'], { x: 5, y: -5 })
		expect(controller.getData().nodes[0]).toMatchObject({ position: { x: 15, y: 5 }, isPinned: true })
		await controller.move(['a', 'b'], { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
		expect(controller.getData().nodes[1].position).toEqual({ x: 2, y: 2 })
		expect(eventsOf('node-move')[0]).toEqual({ ids: ['a'], positions: { a: { x: 15, y: 5 } }, source: 'api' })
	})

	it('move узла без позиции берёт позицию из раскладки; неизвестный узел — not-found', async () => {
		const { controller, model } = createHarness(map({ nodes: [node('a'), node('b')], edges: [edge('e', ['a', 'b'])] }))
		const rect = model.layout.value.nodes.a
		await controller.move(['a'], { x: 3, y: 4 })
		expect(controller.getData().nodes[0].position).toEqual({ x: rect.x + 3, y: rect.y + 4 })
		expect((await controller.move(['ghost'], { x: 1, y: 1 })).reject?.code).toBe('not-found')
		expect((await controller.move(['b'], { zzz: { x: 1, y: 1 } })).reject?.code).toBe('not-found')
	})

	it('движения одних и тех же узлов подряд склеиваются в один шаг', async () => {
		const { controller, model } = createHarness(map({ nodes: [node('a', { position: { x: 0, y: 0 } })] }))
		await controller.move(['a'], { x: 1, y: 0 })
		await controller.move(['a'], { x: 1, y: 0 })
		expect(model.history.list()).toHaveLength(1)
		controller.undo()
		expect(controller.getData().nodes[0].position).toEqual({ x: 0, y: 0 })
	})
})

import { nextTick } from 'vue'
import { notationWith } from '../fixtures/layoutScope'
import { createHarness } from '../fixtures/modelHarness'
import { edge, group, map, node } from '../fixtures/flowData'
import { createFlowEvents } from '../../../../model/controller/flowEvents'
import type { FlowDataIssue } from '../../../../types/api/flowNotation.types'
import type { FlowMapPlugin } from '../../../../types/api/flowController.types'

const base = map({ nodes: [node('a', { position: { x: 0, y: 0 } }), node('b')], edges: [edge('e', ['a', 'b'], { kind: 'call' })] })

describe('исполнение: редкие пути', () => {
	it('ошибка проверки без привязки к элементу тоже считается новой ошибкой', async () => {
		const validate = (data: { nodes: unknown[] }): FlowDataIssue[] =>
			data.nodes.length > 2 ? [{ level: 'error', code: 'too-many', message: 'Слишком много' }] : []
		const notation = notationWith({ rules: { validate: validate as never } })
		const { controller } = createHarness(map({ notation: 'rules', nodes: [node('a'), node('b')] }), {
			props: { notations: [notation] },
		})
		const result = await controller.updateNode('a', { kind: 'store' })
		expect(result.isApplied).toBe(true)
		const added = await controller.addNode(node('c'))
		expect(added.reject).toMatchObject({ by: 'limit', code: 'issues' })
	})

	it('move: beforeChange заменил изменения — node-move собирает только позиции', async () => {
		const { controller, eventsOf } = createHarness(base)
		controller.on('beforeChange', ctx =>
			ctx.command === 'move'
				? ([
						{ type: 'root', patch: { title: 'T' }, previous: {} },
						{ type: 'update', entity: 'node', id: 'b', patch: { label: 'B2' }, previous: { label: 'b' } },
						{
							type: 'update',
							entity: 'node',
							id: 'a',
							patch: { position: { x: 9, y: 9 } },
							previous: { position: { x: 0, y: 0 } },
						},
					] as never)
				: undefined,
		)
		await controller.move(['a'], { x: 1, y: 1 })
		expect(eventsOf('node-move')[0]).toMatchObject({ ids: ['a'], positions: { a: { x: 9, y: 9 } } })
	})

	it('исключение хука на команде без своего хука относится к beforeChange', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { controller } = createHarness(base)
		controller.on('beforeChange', () => {
			throw new Error('bad')
		})
		const result = await controller.move(['a'], { x: 1, y: 1 })
		expect(result.reject).toMatchObject({ by: 'hook', code: 'beforeChange' })
		warn.mockRestore()
	})

	it('смена одного хука-пропса не пересоздаёт подписку на другой', async () => {
		const create = vi.fn()
		const remove = vi.fn()
		const { controller, props } = createHarness(base, { props: { beforeCreate: create, beforeDelete: remove } })
		const before = controller.getBindings().map(item => item.id)
		props.beforeDelete = vi.fn()
		const after = controller.getBindings().map(item => item.id)
		expect(after.filter(id => before.includes(id))).toHaveLength(1)
		await controller.addNode(node('x'))
		expect(create).toHaveBeenCalledTimes(1)
	})

	it('connect: конец связи объектом с портом; addEdge без вида берёт вид нотации', async () => {
		const notation = notationWith()
		const { controller } = createHarness(map({ notation: 'rules', nodes: [node('x', { kind: 'store' }), node('y')] }), {
			props: { notations: [notation] },
		})
		const result = await controller.connect({ node: 'x', port: 'out' }, { node: 'y' }, { id: 'one' })
		expect(result.isApplied).toBe(true)
		expect(controller.getData().edges[0]).toMatchObject({ sourcePort: 'out', kind: 'flow' })
		expect((await controller.addEdge(edge('two', ['y', 'x']))).isApplied).toBe(true)
	})

	it('удаление узла в данных без групп', async () => {
		const { controller } = createHarness(base)
		expect((await controller.remove(['b'])).isApplied).toBe(true)
		expect(controller.getData().edges).toEqual([])
	})
})

describe('раскладка и состояние: редкие пути', () => {
	it('узел, которого нет в раскладке (цикл групп), не мешает команде layout', async () => {
		const cyclic = map({
			groups: [group('x', { kind: 'zone', parent: 'y' }), group('y', { kind: 'zone', parent: 'x' })],
			nodes: [node('a', { group: 'x' }), node('b')],
		})
		const { controller, model } = createHarness(cyclic)
		expect(Object.keys(model.layout.value.nodes).sort()).toEqual(['a', 'b'])
		const result = await controller.layout({ isForced: true })
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes).toHaveLength(2)
	})

	it('маршруты модели считаются по раскладке', () => {
		const { model } = createHarness(base)
		expect(Object.keys(model.routes.value)).toEqual(['e'])
	})

	it('плагины без раскладок, маршрутизаторов и проверок не мешают', () => {
		const plugins: FlowMapPlugin[] = [{ name: 'empty' }]
		const { model, controller } = createHarness(base, { props: { plugins } })
		expect(model.routes.value.e).toBeDefined()
		expect(controller.validate()).toEqual([])
	})

	it('без isCompact модель работает как не компактная', () => {
		const { model } = createHarness(map({ nodes: [node('a')] }), { hasCompact: false })
		expect(model.layout.value.nodes.a.width).toBeGreaterThan(72)
	})

	it('данные, которые родитель вернул из update:data, не перечитываются', async () => {
		const { controller, props, eventsOf } = createHarness(base)
		await controller.addNode(node('c'))
		const committed = controller.getData()
		const validates = eventsOf('validate').length
		props.data = committed
		await nextTick()
		expect(controller.getData()).toBe(committed)
		expect(eventsOf('validate')).toHaveLength(validates)
	})

	it('смена списка нотаций перечитывает данные', async () => {
		const { props, eventsOf } = createHarness(base)
		props.notations = []
		await nextTick()
		expect(eventsOf('validate')).toEqual([])
	})
})

describe('ревью: редкие пути', () => {
	const user = { name: 'Анна' }

	it('принятие одного из нескольких предложений не трогает остальные', async () => {
		const suggestions = [
			{
				id: 'p1',
				author: user,
				date: 1,
				status: 'open' as const,
				changes: [{ type: 'add' as const, entity: 'node' as const, value: node('n1') }],
			},
			{
				id: 'p2',
				author: user,
				date: 2,
				status: 'open' as const,
				changes: [{ type: 'add' as const, entity: 'node' as const, value: node('n2') }],
			},
		]
		const { controller, eventsOf } = createHarness(base, { props: { suggestions, currentUser: user } })
		await controller.accept('p2')
		const last = eventsOf('update:suggestions').at(-1) as { id: string; status: string }[]
		expect(last.map(item => item.status)).toEqual(['open', 'accepted'])
	})

	it('compare без версий — пусто', () => {
		const { controller } = createHarness(base)
		expect(controller.compare('v1')).toEqual([])
		expect(controller.compare('v1', 'v2')).toEqual([])
	})
})

describe('шина событий отдельно', () => {
	it('обработчик не функция: в списке подписок имя пустое', () => {
		const bus = createFlowEvents({ environment: { isVisible: () => true, isReducedMotion: () => false, announce: () => undefined } })
		bus.subscribe('change', 5 as never)
		expect(bus.list()[0].handler).toBe('')
	})

	it('работает без emit и без слушателей компонента, повторная отписка безопасна', () => {
		const bus = createFlowEvents({ environment: { isVisible: () => true, isReducedMotion: () => false, announce: () => undefined } })
		const handler = vi.fn()
		const off = bus.subscribe('change', handler)
		bus.emit('change', {} as never)
		off()
		off()
		bus.emit('change', {} as never)
		expect(handler).toHaveBeenCalledTimes(1)
		expect(bus.list()).toHaveLength(0)
		expect(bus.setEnabled('nothing', true)).toBe(false)
		expect(bus.resultOf('x')).toBeUndefined()
	})

	it('отключённое событие компонента не уходит в emit', () => {
		const emit = vi.fn()
		const bus = createFlowEvents({
			emit,
			listeners: () => ({ change: () => undefined }),
			environment: { isVisible: () => true, isReducedMotion: () => false, announce: () => undefined },
		})
		expect(bus.setEnabled('event:change', false)).toBe(true)
		bus.emit('change', {} as never)
		expect(emit).not.toHaveBeenCalled()
	})
})

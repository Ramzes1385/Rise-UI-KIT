import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import { refuse } from '../../../../model/execute/flowReject'
import type { FlowEventBus } from '../../../../types/internal/core/flowModelCore.types'
import type { FlowChangeEvent, FlowRejectEvent } from '../../../../types/api/flowController.types'

const services = map({
	nodes: [node('gw', { kind: 'gateway' }), node('api', { kind: 'service' }), node('db', { kind: 'database' })],
	edges: [edge('e1', ['gw', 'api'], { kind: 'call' })],
})

describe('конвейер команд', () => {
	it('addNode применяется, шлёт update:data и change, пишется в историю', async () => {
		const { controller, eventsOf, model } = createHarness(services)
		const result = await controller.addNode(node('cache', { kind: 'cache' }))
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['gw', 'api', 'db', 'cache'])
		expect(eventsOf('update:data')).toHaveLength(1)
		const change = eventsOf('change')[0] as FlowChangeEvent
		expect(change).toMatchObject({ source: 'api', command: 'add-node' })
		expect(change.changes).toEqual(result.changes)
		expect(model.history.state.value.canUndo).toBe(true)
		expect(controller.getHistory().undoLabel).toContain('cache')
	})

	it('повтор id отклоняется без изменений и без записи в историю', async () => {
		const { controller, eventsOf } = createHarness(services)
		const result = await controller.addNode(node('api'))
		expect(result.isApplied).toBe(false)
		expect(result.reject).toMatchObject({ by: 'limit', code: 'duplicate-id', command: 'add-node' })
		expect(eventsOf('reject')).toEqual([result.reject])
		expect(controller.getHistory().canUndo).toBe(false)
		expect(controller.getData().nodes).toHaveLength(3)
	})

	it('isDisabled запрещает любую команду', async () => {
		const { controller } = createHarness(services, { props: { isDisabled: true } })
		const result = await controller.addNode(node('x'))
		expect(result.reject).toMatchObject({ by: 'limit', code: 'disabled' })
		expect(controller.getData().nodes).toHaveLength(3)
	})

	it('undo и redo применяют обратные и прямые изменения, шлют change с source history и озвучивают', async () => {
		const { controller, eventsOf, announced, model } = createHarness(services)
		await controller.addNode(node('cache', { kind: 'cache' }))
		controller.undo()
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['gw', 'api', 'db'])
		expect(announced[0]).toContain('cache')
		expect(model.history.state.value.canRedo).toBe(true)
		controller.redo()
		expect(controller.getData().nodes).toHaveLength(4)
		expect(announced[1]).toContain('cache')
		const events = eventsOf('change') as FlowChangeEvent[]
		expect(events.map(item => [item.source, item.command])).toEqual([
			['api', 'add-node'],
			['history', 'undo'],
			['history', 'redo'],
		])
	})

	it('undo без шагов ничего не озвучивает', () => {
		const { controller, announced } = createHarness(services)
		controller.undo()
		controller.redo()
		expect(announced).toEqual([])
	})

	it('clearHistory очищает историю', async () => {
		const { controller } = createHarness(services)
		await controller.addNode(node('x'))
		controller.clearHistory()
		expect(controller.getHistory()).toMatchObject({ canUndo: false, canRedo: false })
	})

	it('правило нотации отклоняет связь раньше хуков', async () => {
		const { controller, eventsOf } = createHarness(services)
		const hook = vi.fn()
		controller.on('beforeConnect', hook)
		controller.on('beforeChange', hook)
		const result = await controller.connect('db', 'api')
		expect(result.reject).toMatchObject({ by: 'rule', code: 'connection-not-allowed' })
		expect(hook).not.toHaveBeenCalled()
		expect(eventsOf('reject')).toHaveLength(1)
	})

	it('порядок: правило, затем beforeConnect, затем beforeChange', async () => {
		const { controller } = createHarness(services)
		const order: string[] = []
		controller.on('beforeChange', () => void order.push('beforeChange'))
		controller.on('beforeConnect', () => void order.push('beforeConnect'))
		const result = await controller.connect('api', 'db')
		expect(result.isApplied).toBe(true)
		expect(order).toEqual(['beforeConnect', 'beforeChange'])
	})

	it('хук может отменить: reject с by hook и пометкой в привязках', async () => {
		const { controller, eventsOf } = createHarness(services)
		controller.on('beforeCreate', () => false)
		const result = await controller.addNode(node('x'))
		expect(result.reject).toMatchObject({ by: 'hook', code: 'beforeCreate' })
		expect((eventsOf('reject')[0] as FlowRejectEvent).command).toBe('add-node')
		expect(controller.getBindings().find(item => item.name === 'beforeCreate')?.lastResult).toContain('beforeCreate')
		expect(controller.getData().nodes).toHaveLength(3)
	})

	it('хук может подменить значение: beforeCreate, beforeEditLabel, beforeConnect', async () => {
		const { controller } = createHarness(services)
		controller.on('beforeCreate', ctx => ({ ...(ctx.value as object), label: 'Из хука' }) as never)
		await controller.addNode(node('x'))
		expect(controller.getData().nodes[3].label).toBe('Из хука')
		controller.on('beforeEditLabel', ctx => ctx.value.toUpperCase())
		await controller.updateNode('api', { label: 'abc' })
		expect(controller.getData().nodes[1].label).toBe('ABC')
		controller.on('beforeConnect', ctx => ({ ...ctx.edge, label: 'Подмена' }))
		await controller.connect('api', 'db')
		expect(controller.getData().edges[1].label).toBe('Подмена')
	})

	it('beforeChange может заменить список изменений и отменить', async () => {
		const { controller } = createHarness(services)
		const off = controller.on('beforeChange', ctx => [...ctx.changes, { type: 'root', patch: { title: 'Метка' }, previous: {} }])
		await controller.addNode(node('x'))
		expect(controller.getData().title).toBe('Метка')
		off()
		controller.on('beforeChange', () => false)
		const result = await controller.addNode(node('y'))
		expect(result.reject).toMatchObject({ by: 'hook', code: 'beforeChange' })
	})

	it('beforeChange получает контекст: команду, источник и данные', async () => {
		const { controller } = createHarness(services)
		const seen = vi.fn()
		controller.on('beforeChange', seen)
		await controller.addNode(node('x'))
		expect(seen).toHaveBeenCalledWith(expect.objectContaining({ command: 'add-node', source: 'api', data: services }))
	})

	it('сбой обработчика события error не ломает очередь: вызов отклоняется, следующая команда выполняется', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		let isBroken = true
		const { controller } = createHarness(services, {
			emit: name => {
				if (name === 'error' && isBroken) throw new Error('listener')
			},
		})
		const off = controller.on('beforeCreate', () => {
			throw new Error('boom')
		})
		await expect(controller.addNode(node('x'))).rejects.toThrow('listener')
		off()
		isBroken = false
		const next = await controller.addNode(node('y'))
		expect(next.isApplied).toBe(true)
		expect(controller.getData().nodes.map(item => item.id)).toContain('y')
		warn.mockRestore()
	})

	it('исключение в хуке: предупреждение, событие error и отмена команды', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { controller, eventsOf } = createHarness(services)
		controller.on('beforeCreate', () => {
			throw new Error('boom')
		})
		const result = await controller.addNode(node('x'))
		expect(result.isApplied).toBe(false)
		expect(result.reject).toMatchObject({ by: 'hook', code: 'beforeCreate' })
		expect(eventsOf('error')[0]).toMatchObject({ code: 'hook-failed' })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('boom')
		warn.mockRestore()
	})

	it('исключение не-Error тоже превращается в текст', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { controller } = createHarness(services)
		controller.on('beforeChange', () => {
			throw 'строка'
		})
		await controller.addNode(node('x'))
		expect(warn.mock.calls[0][0]).toContain('строка')
		warn.mockRestore()
	})

	it('асинхронные хуки выстраивают команды в очередь по порядку', async () => {
		const { controller } = createHarness(services)
		const order: string[] = []
		controller.on('beforeCreate', async ctx => {
			const id = (ctx.value as { id: string }).id
			order.push(`start ${id}`)
			await new Promise(resolve => setTimeout(resolve, id === 'one' ? 20 : 1))
			order.push(`end ${id}`)
		})
		const first = controller.addNode(node('one'))
		const second = controller.addNode(node('two'))
		await Promise.all([first, second])
		expect(order).toEqual(['start one', 'end one', 'start two', 'end two'])
		expect(
			controller
				.getData()
				.nodes.map(item => item.id)
				.slice(3),
		).toEqual(['one', 'two'])
	})

	it('данные изменились, пока хук думал, — команда отменяется как устаревшая', async () => {
		const { controller } = createHarness(services)
		let release: () => void = () => undefined
		controller.on('beforeCreate', () => new Promise<void>(resolve => (release = resolve)))
		const pending = controller.addNode(node('x'))
		await vi.waitFor(() => expect(release).not.toBeUndefined())
		controller.applyRemote([{ type: 'root', patch: { title: 'Чужое' }, previous: {} }])
		release()
		const result = await pending
		expect(result.reject).toMatchObject({ by: 'limit', code: 'stale' })
		expect(controller.getData().nodes).toHaveLength(3)
	})

	it('изменение, нарушающее структуру, отклоняется кодом issues; уже существующие ошибки не мешают', async () => {
		const { controller } = createHarness(services)
		const bad = await controller.updateNode('api', { group: 'nowhere' })
		expect(bad.reject).toMatchObject({ by: 'limit', code: 'issues' })
		expect(controller.getData().nodes[1].group).toBeUndefined()
		const broken = createHarness(map({ nodes: [node('a', { group: 'ghost' }), node('b')] }))
		expect((await broken.controller.updateNode('b', { kind: 'database' })).isApplied).toBe(true)
	})

	it('нейтральные поля не запускают проверку структуры', async () => {
		const { controller } = createHarness(map({ nodes: [node('a', { group: 'ghost' })] }))
		expect((await controller.updateNode('a', { subtitle: 'ok' })).isApplied).toBe(true)
	})
})

describe('refuse: отказ и подсказка читателю с экрана', () => {
	function bus() {
		const emit = vi.fn()
		const note = vi.fn()
		return { events: { emit, note } as unknown as FlowEventBus, emit, note }
	}

	it('отказ хука с кодом озвучивается: код и сообщение уходят в note', () => {
		const { events, emit, note } = bus()
		const reject = { command: 'delete', by: 'hook' as const, code: 'beforeDelete', message: 'Нельзя' }
		expect(refuse(events, reject)).toEqual({ isApplied: false, changes: [], reject })
		expect(emit).toHaveBeenCalledWith('reject', reject)
		expect(note).toHaveBeenCalledWith('beforeDelete', 'Нельзя')
	})

	it('у хука без сообщения озвучивается пустая строка', () => {
		const { events, note } = bus()
		refuse(events, { command: 'delete', by: 'hook', code: 'beforeDelete' })
		expect(note).toHaveBeenCalledWith('beforeDelete', '')
	})

	it('отказ хука без кода и отказы правил и пределов не озвучиваются отдельно', () => {
		const { events, emit, note } = bus()
		refuse(events, { command: 'delete', by: 'hook' })
		refuse(events, { command: 'connect', by: 'rule', code: 'port', message: 'Порт занят' })
		refuse(events, { command: 'connect', by: 'limit', code: 'disabled' })
		expect(emit).toHaveBeenCalledTimes(3)
		expect(note).not.toHaveBeenCalled()
	})
})

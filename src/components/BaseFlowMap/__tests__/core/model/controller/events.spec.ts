import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import { readListeners } from '../../../../model/state/flowListeners'

const data = map({ nodes: [node('a'), node('b', { kind: 'database' })], edges: [edge('e', ['a', 'b'])] })

describe('события и привязки', () => {
	it('подписчик контроллера получает события, отписка работает, исключение подписчика не ломает остальных', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { controller } = createHarness(data)
		const seen = vi.fn()
		controller.on('change', () => {
			throw new Error('subscriber failed')
		})
		const off = controller.on('change', seen)
		await controller.addNode(node('c'))
		expect(seen).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('subscriber failed')
		off()
		await controller.addNode(node('d'))
		expect(seen).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})

	it('не-Error исключение подписчика попадает в предупреждение текстом', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { controller } = createHarness(data)
		controller.on('change', () => {
			throw 'plain'
		})
		await controller.addNode(node('c'))
		expect(warn.mock.calls[0][0]).toContain('plain')
		warn.mockRestore()
	})

	it('события дублируются в emit компонента, а включённый слушатель считает вызовы', async () => {
		const listener = function onChange(): void {}
		const { controller, emitted } = createHarness(data, { listeners: { change: listener } })
		await controller.addNode(node('c'))
		expect(emitted.some(item => item.name === 'change')).toBe(true)
		const binding = controller.getBindings().find(item => item.id === 'event:change')
		expect(binding).toMatchObject({ name: 'change', handler: 'onChange', isEnabled: true, calls: 1, isCancellable: false })
	})

	it('setBindingEnabled выключает слушатель компонента, подписку контроллера и хук', async () => {
		const { controller, emitted } = createHarness(data, { listeners: { change: () => undefined } })
		const sub = vi.fn()
		controller.on('change', sub)
		controller.on('beforeCreate', () => false)
		const bindings = controller.getBindings()
		const own = bindings.find(item => item.id === 'event:change')
		const subscription = bindings.find(item => item.name === 'change' && item.id !== 'event:change')
		const hook = bindings.find(item => item.name === 'beforeCreate')
		expect(hook?.isCancellable).toBe(true)
		controller.setBindingEnabled(own?.id ?? '', false)
		controller.setBindingEnabled(subscription?.id ?? '', false)
		controller.setBindingEnabled(hook?.id ?? '', false)
		const result = await controller.addNode(node('c'))
		expect(result.isApplied).toBe(true)
		expect(sub).not.toHaveBeenCalled()
		expect(emitted.filter(item => item.name === 'change')).toHaveLength(0)
		controller.setBindingEnabled(own?.id ?? '', true)
		controller.setBindingEnabled('event:never-listened', false)
		controller.setBindingEnabled('nothing-like-this', false)
		await controller.addNode(node('d'))
		expect(emitted.filter(item => item.name === 'change')).toHaveLength(1)
	})

	it('привязки: сначала хуки, затем слушатели компонента, затем подписки; нефункции игнорируются', () => {
		const { controller } = createHarness(data, { listeners: { ready: () => undefined, bogus: 'not a function' } })
		controller.on('node-click', () => undefined)
		controller.on('beforeChange', function guard() {})
		const names = controller.getBindings().map(item => item.name)
		expect(names).toEqual(['beforeChange', 'ready', 'node-click'])
		expect(controller.getBindings()[0].handler).toBe('guard')
	})

	it('сменные хуки из пропсов: подписка следует за пропсом, замена и удаление снимают прежний', async () => {
		const first = vi.fn()
		const second = vi.fn()
		const { controller, props } = createHarness(data, { props: { beforeCreate: first } })
		await controller.addNode(node('c'))
		expect(first).toHaveBeenCalledTimes(1)
		props.beforeCreate = second
		await controller.addNode(node('d'))
		expect(first).toHaveBeenCalledTimes(1)
		expect(second).toHaveBeenCalledTimes(1)
		props.beforeCreate = undefined
		await controller.addNode(node('e'))
		expect(second).toHaveBeenCalledTimes(1)
		expect(controller.getBindings().filter(item => item.name === 'beforeCreate')).toEqual([])
	})

	it('хук из пропса отменяет команду и виден в привязках под именем функции', async () => {
		function forbid(): boolean {
			return false
		}
		const { controller } = createHarness(data, { props: { beforeCreate: forbid } })
		expect(controller.getBindings()[0]).toMatchObject({ name: 'beforeCreate', handler: 'forbid' })
		expect((await controller.addNode(node('c'))).reject?.by).toBe('hook')
	})

	it('прокидывание ошибок загрузки: данные с ошибкой шлют error и validate', () => {
		const { eventsOf } = createHarness({ version: 5, nodes: [], edges: [] })
		expect(eventsOf('error')).toHaveLength(1)
		expect(eventsOf('validate')).toHaveLength(1)
		expect((eventsOf('error')[0] as { code: string }).code).toBe('version-unsupported')
	})

	it('новые данные из пропсов перечитываются и шлют validate, а свои правки пропс не перегружают', async () => {
		const { controller, props, eventsOf } = createHarness(data)
		await controller.addNode(node('c'))
		expect(controller.getData().nodes).toHaveLength(3)
		props.data = map({ nodes: [node('z')] })
		await Promise.resolve()
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['z'])
		props.data = { version: 9, nodes: [], edges: [] }
		await Promise.resolve()
		expect(eventsOf('validate').length).toBeGreaterThan(0)
	})

	it('неизвестная нотация данных — предупреждение и нотация по умолчанию', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model } = createHarness(map({ notation: 'mystery' }))
		expect(model.notation.value.id).toBe('services')
		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})

	it('кинд-резолверы модели: найденные виды и запасные', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model } = createHarness(
			map({ groups: [{ id: 'g', kind: 'zone', label: 'g' }], nodes: [node('a', { kind: 'unknown-kind-zzz' })] }),
		)
		expect(model.nodeKind(node('x', { kind: 'database' })).shape.shape).toBeDefined()
		expect(model.nodeKind(node('x', { kind: 'unknown-kind-zzz' })).label()).toBe('')
		expect(model.edgeKind(edge('e', ['a', 'b'])).stroke).toBeDefined()
		expect(model.groupKind({ id: 'g', kind: 'zone', label: 'g' }).layout).toBe('box')
		warn.mockRestore()
	})
})

describe('readListeners', () => {
	it('on-пропсы функции превращаются в имена событий', () => {
		expect(
			readListeners({
				onChange: () => undefined,
				'onUpdate:data': () => undefined,
				onNodeClick: () => undefined,
				onHistoryChange: () => undefined,
				class: 'x',
				onBad: 1,
			}),
		).toEqual({
			change: expect.any(Function),
			'update:data': expect.any(Function),
			'node-click': expect.any(Function),
			'history-change': expect.any(Function),
		})
	})

	it('пусто и null дают пустой объект', () => {
		expect(readListeners(undefined)).toEqual({})
		expect(readListeners(null)).toEqual({})
	})
})

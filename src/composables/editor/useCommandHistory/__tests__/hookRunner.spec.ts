import { createHookRunner } from '../helpers/hookRunner'

interface Hooks {
	beforeAdd: (context: {
		node: { id: string }
		user: string
	}) => boolean | void | { id: string } | Promise<boolean | void | { id: string }>
	afterAdd: (context: { id: string }) => void
}

function create() {
	return createHookRunner<Hooks>()
}

const context = { node: { id: 'n1' }, user: 'roman' }
const initial = { id: 'n1' }

describe('createHookRunner', () => {
	it('без обработчиков не отменяет и возвращает исходное значение', async () => {
		const hooks = create()
		expect(hooks.has('beforeAdd')).toBe(false)
		await expect(hooks.run('beforeAdd', context, initial)).resolves.toEqual({ isCancelled: false, value: initial })
	})

	it('обработчики идут по убыванию приоритета, при равенстве — в порядке подписки', async () => {
		const hooks = create()
		const order: string[] = []
		hooks.on('beforeAdd', () => void order.push('low'), { priority: -5 })
		hooks.on('beforeAdd', () => void order.push('first-zero'))
		hooks.on('beforeAdd', () => void order.push('high'), { priority: 10 })
		hooks.on('beforeAdd', () => void order.push('second-zero'))
		await hooks.run('beforeAdd', context, initial)
		expect(order).toEqual(['high', 'first-zero', 'second-zero', 'low'])
	})

	it('false отменяет и останавливает следующие обработчики', async () => {
		const hooks = create()
		const after = vi.fn()
		hooks.on('beforeAdd', () => false, { priority: 5 })
		hooks.on('beforeAdd', after)
		await expect(hooks.run('beforeAdd', context, initial)).resolves.toEqual({ isCancelled: true, value: initial })
		expect(after).not.toHaveBeenCalled()
	})

	it('true и undefined значение не меняют', async () => {
		const hooks = create()
		hooks.on('beforeAdd', () => undefined)
		const outcome = await hooks.run('beforeAdd', context, initial)
		expect(outcome.value).toBe(initial)
	})

	it('объект заменяет значение, а в контексте следующих подставляется вместо прежнего', async () => {
		const hooks = create()
		const seen: unknown[] = []
		const replaced = { id: 'n2' }
		hooks.on('beforeAdd', () => replaced, { priority: 2 })
		hooks.on('beforeAdd', ctx => void seen.push(ctx))
		const source = { node: initial, user: 'roman' }
		const outcome = await hooks.run('beforeAdd', source, initial)
		expect(outcome.value).toBe(replaced)
		expect(seen).toEqual([{ node: replaced, user: 'roman' }])
	})

	it('замена не трогает контекст, который не объект или где нет прежнего значения', async () => {
		const hooks = create()
		const seen: unknown[] = []
		hooks.on('beforeAdd', () => ({ id: 'x' }), { priority: 2 })
		hooks.on('beforeAdd', ctx => void seen.push(ctx))
		const unrelated = { node: { id: 'other' }, user: 'a' }
		await hooks.run('beforeAdd', unrelated, initial)
		expect(seen).toEqual([unrelated])
		seen.length = 0
		await hooks.run('beforeAdd', null as never, null as never)
		expect(seen).toEqual([null])
		seen.length = 0
		await hooks.run('beforeAdd', 'text' as never, 'prev' as never)
		expect(seen).toEqual(['text'])
	})

	it('замена на то же значение (идентичный объект) контекст не копирует', async () => {
		const hooks = create()
		const seen: unknown[] = []
		hooks.on('beforeAdd', () => initial, { priority: 2 })
		hooks.on('beforeAdd', ctx => void seen.push(ctx))
		const source = { node: initial, user: 'u' }
		await hooks.run('beforeAdd', source, initial)
		expect(seen[0]).toBe(source)
	})

	it('Promise ждётся: false из асинхронного обработчика отменяет, объект заменяет', async () => {
		const hooks = create()
		const unsubscribe = hooks.on('beforeAdd', async () => false)
		await expect(hooks.run('beforeAdd', context, initial)).resolves.toMatchObject({ isCancelled: true })
		unsubscribe()
		const replaced = { id: 'async' }
		hooks.on('beforeAdd', async () => replaced)
		await expect(hooks.run('beforeAdd', context, initial)).resolves.toEqual({ isCancelled: false, value: replaced })
	})

	it('отписка снимает обработчик, повторная отписка безопасна', async () => {
		const hooks = create()
		const handler = vi.fn()
		const off = hooks.on('afterAdd', handler)
		expect(hooks.has('afterAdd')).toBe(true)
		off()
		off()
		expect(hooks.has('afterAdd')).toBe(false)
		await hooks.run('afterAdd', { id: 'a' }, undefined as never)
		expect(handler).not.toHaveBeenCalled()
	})

	it('исключение обработчика не гасится', async () => {
		const hooks = create()
		hooks.on('beforeAdd', () => {
			throw new Error('hook failed')
		})
		await expect(hooks.run('beforeAdd', context, initial)).rejects.toThrow('hook failed')
	})

	it('list: подписки по убыванию приоритета, имя функции, счётчик вызовов', async () => {
		const hooks = create()
		function guard(): void {}
		hooks.on('beforeAdd', guard, { priority: 1 })
		hooks.on('afterAdd', () => undefined, { priority: 9 })
		hooks.on('beforeAdd', () => undefined, { priority: 3 })
		await hooks.run('beforeAdd', context, initial)
		const all = hooks.list()
		expect(all.map(item => [item.name, item.priority])).toEqual([
			['afterAdd', 9],
			['beforeAdd', 3],
			['beforeAdd', 1],
		])
		const own = hooks.list('beforeAdd')
		expect(own).toHaveLength(2)
		expect(own[1]).toMatchObject({ handler: 'guard', calls: 1, isEnabled: true })
		expect(own[0].id).not.toBe(own[1].id)
		expect(hooks.list('afterAdd')[0].calls).toBe(0)
	})

	it('setEnabled выключает и включает подписку; неизвестный id игнорируется', async () => {
		const hooks = create()
		const handler = vi.fn()
		hooks.on('beforeAdd', handler)
		const [subscription] = hooks.list('beforeAdd')
		hooks.setEnabled(subscription.id, false)
		expect(hooks.has('beforeAdd')).toBe(false)
		expect(hooks.list('beforeAdd')[0].isEnabled).toBe(false)
		await hooks.run('beforeAdd', context, initial)
		expect(handler).not.toHaveBeenCalled()
		hooks.setEnabled(subscription.id, true)
		expect(hooks.has('beforeAdd')).toBe(true)
		hooks.setEnabled('hook-unknown', false)
		await hooks.run('beforeAdd', context, initial)
		expect(handler).toHaveBeenCalledTimes(1)
	})
})

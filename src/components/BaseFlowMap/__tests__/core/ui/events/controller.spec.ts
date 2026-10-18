import '@testing-library/jest-dom/vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { readListeners } from '../../../../model/state/flowListeners'
import { controllerOf, fired, mapData, mountMap, pinned } from '../flowUi'

describe('readListeners', () => {
	it('превращает onXxxYyy в xxx-yyy и onUpdate:xxx в update:xxx, остальное отбрасывает', () => {
		const handler = () => undefined
		expect(
			readListeners({
				onNodeClick: handler,
				onReady: handler,
				'onUpdate:data': handler,
				onFocusChange: handler,
				onlyLower: handler,
				onBroken: 'не функция',
				class: 'x',
			}),
		).toEqual({ 'node-click': handler, ready: handler, 'update:data': handler, 'focus-change': handler })
		expect(readListeners(null)).toEqual({})
		expect(readListeners(undefined)).toEqual({})
	})
})

describe('BaseFlowMap controller.on', () => {
	it('подписывает на события и снимает подписку', async () => {
		const result = mountMap()
		const controller = controllerOf(result as never)
		const handler = vi.fn<(value: unknown) => void>()
		const off = controller.on('node-click', handler)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.mock.calls[0][0]).toMatchObject({ target: { id: 'a' } })
		off()
		off()
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Beta/ }))
		expect(handler).toHaveBeenCalledTimes(1)
	})

	it('исключение в подписчике не ломает карту и остальных подписчиков, а приложение получает предупреждение', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const result = mountMap()
		const controller = controllerOf(result as never)
		const other = vi.fn()
		controller.on('node-click', () => {
			throw new Error('сбой подписчика')
		})
		controller.on('node-click', other)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(other).toHaveBeenCalledTimes(1)
		expect(result.emitted()['node-click']).toHaveLength(1)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String((warn.mock.calls[0] as unknown[])[0])).toContain('сбой подписчика')
	})

	it('подписка на хук отменяет команду с причиной и приходит в getBindings', async () => {
		const result = mountMap()
		const controller = controllerOf(result as never)
		const off = controller.on('beforeDelete', () => false)
		const outcome = await controller.remove(['a'])
		expect(outcome.isApplied).toBe(false)
		expect(fired(result, 'reject').at(-1)?.[0]).toMatchObject({ by: 'hook' })
		const binding = controller.getBindings().find(item => item.name === 'beforeDelete')
		expect(binding).toMatchObject({ isCancellable: true, isEnabled: true, calls: 1 })
		expect(binding?.lastResult).toBeTruthy()
		off()
		expect((await controller.remove(['c'])).isApplied).toBe(true)
	})

	it('хук, бросивший исключение, отменяет команду, шлёт error и предупреждает', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const result = mountMap()
		const controller = controllerOf(result as never)
		controller.on('beforeDelete', () => {
			throw new Error('сбой хука')
		})
		const outcome = await controller.remove(['a'])
		expect(outcome.isApplied).toBe(false)
		expect(fired(result, 'error').at(-1)?.[0]).toMatchObject({ code: 'hook-failed' })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String((warn.mock.calls[0] as unknown[])[0])).toContain('сбой хука')
	})

	it('приоритет хука: больший вызывается раньше', async () => {
		const result = mountMap()
		const controller = controllerOf(result as never)
		const order: string[] = []
		controller.on('beforeDelete', () => void order.push('low'), { priority: 1 })
		controller.on('beforeDelete', () => void order.push('high'), { priority: 10 })
		await controller.remove(['c'])
		expect(order).toEqual(['high', 'low'])
	})
})

describe('BaseFlowMap привязки (getBindings)', () => {
	it('имя обработчика берётся из пропа-слушателя и из хука-пропа, подписки через on идут отдельно', () => {
		function whenClicked() {}
		function guardChange() {
			return true
		}
		const result = mountMap({ onNodeClick: whenClicked, beforeChange: guardChange } as never)
		const controller = controllerOf(result as never)
		controller.on('beforeConnect', function guardConnect() {
			return true
		})
		controller.on('node-leave', () => undefined)
		const bindings = controller.getBindings()
		expect(bindings.find(item => item.name === 'beforeChange')).toMatchObject({ handler: 'guardChange', isCancellable: true, calls: 0 })
		expect(bindings.find(item => item.name === 'beforeConnect')).toMatchObject({ handler: 'guardConnect', isCancellable: true })
		expect(bindings.find(item => item.id === 'event:node-click')).toMatchObject({ handler: 'whenClicked', isCancellable: false })
		expect(bindings.find(item => item.name === 'node-leave')).toMatchObject({ isCancellable: false, isEnabled: true })
		expect(new Set(bindings.map(item => item.id)).size).toBe(bindings.length)
	})

	it('считает вызовы слушателя пропа и подписок', async () => {
		const handler = vi.fn()
		const result = mountMap({ onNodeClick: handler } as never)
		const controller = controllerOf(result as never)
		controller.on('node-click', () => undefined)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Beta/ }))
		const bindings = controller.getBindings().filter(item => item.name === 'node-click')
		expect(bindings.map(item => item.calls)).toEqual([2, 2])
		expect(handler).toHaveBeenCalledTimes(2)
	})

	it('выключенная привязка события не вызывается, включённая снова работает', async () => {
		const handler = vi.fn()
		const result = mountMap({ onNodeClick: handler } as never)
		const controller = controllerOf(result as never)
		const extra = vi.fn()
		controller.on('node-click', extra)
		controller.setBindingEnabled('event:node-click', false)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(handler).not.toHaveBeenCalled()
		expect(extra).toHaveBeenCalledTimes(1)
		const sub = controller.getBindings().find(item => item.name === 'node-click' && item.id.startsWith('event-sub'))
		controller.setBindingEnabled(sub?.id as string, false)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(extra).toHaveBeenCalledTimes(1)
		controller.setBindingEnabled('event:node-click', true)
		controller.setBindingEnabled(sub?.id as string, true)
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(handler).toHaveBeenCalledTimes(1)
		expect(extra).toHaveBeenCalledTimes(2)
		expect(controller.getBindings().find(item => item.id === 'event:node-click')?.isEnabled).toBe(true)
	})

	it('выключенный хук не вызывается, команда проходит; включённый снова отменяет', async () => {
		const guard = vi.fn(() => false)
		const result = mountMap({ beforeDelete: guard } as never)
		const controller = controllerOf(result as never)
		const id = controller.getBindings().find(item => item.name === 'beforeDelete')?.id as string
		controller.setBindingEnabled(id, false)
		expect((await controller.remove(['c'])).isApplied).toBe(true)
		expect(guard).not.toHaveBeenCalled()
		controller.setBindingEnabled(id, true)
		expect((await controller.remove(['b'])).isApplied).toBe(false)
		expect(guard).toHaveBeenCalledTimes(1)
		expect(controller.getBindings().find(item => item.id === id)).toMatchObject({ calls: 1, isEnabled: true })
	})

	it('выключение неизвестной привязки не падает и ничего не меняет', () => {
		const result = mountMap()
		const controller = controllerOf(result as never)
		controller.setBindingEnabled('нет-такой', false)
		controller.setBindingEnabled('event:zzz', false)
		expect(controller.getBindings().filter(item => item.name === 'zzz')).toEqual([])
	})

	it('смена хука-пропа заменяет обработчик на лету, снятие пропа убирает привязку', async () => {
		const first = vi.fn(() => false)
		const second = vi.fn(() => true)
		const result = mountMap({ beforeDelete: first } as never)
		const controller = controllerOf(result as never)
		expect((await controller.remove(['a'])).isApplied).toBe(false)
		await result.rerender({ beforeDelete: second })
		expect((await controller.remove(['c'])).isApplied).toBe(true)
		expect(second).toHaveBeenCalledTimes(1)
		await result.rerender({ beforeDelete: undefined })
		expect(controller.getBindings().some(item => item.name === 'beforeDelete')).toBe(false)
	})
})

describe('BaseFlowMap плагины и контроллер до монтирования вида', () => {
	it('setup плагина получает контроллер, отключение вызывается при смене плагинов и размонтировании', async () => {
		const dispose = vi.fn()
		const setup = vi.fn(() => dispose)
		const plugin = { name: 'p', setup }
		const result = mountMap({ plugins: [plugin] })
		expect(setup).toHaveBeenCalledTimes(1)
		await result.rerender({ plugins: [{ name: 'q' }] })
		expect(dispose).toHaveBeenCalledTimes(1)
		result.unmount()
	})

	it('в setup вид ещё не готов: запросы к виду безопасны и возвращают заглушки', async () => {
		let seen: unknown[] = []
		const plugin = {
			name: 'early',
			setup: (controller: import('../../../../types/api/flowController.types').FlowMapController) => {
				controller.fitView()
				controller.focus('a')
				controller.zoom('in')
				controller.setViewport({ x: 4, y: 5, zoom: 2 })
				seen = [controller.getViewport()]
				void controller.exportSvg().then(value => seen.push(value))
				void controller.exportPng().then(value => seen.push(value.type))
			},
		}
		mountMap({ plugins: [plugin] })
		await Promise.resolve()
		await Promise.resolve()
		expect(seen).toEqual([{ x: 4, y: 5, zoom: 2 }, '', 'image/png'])
	})

	it('плагин вместе с нотацией добавляет вид узла в карту', () => {
		const kind = {
			label: () => 'Моё',
			render: 'html' as const,
			shape: { shape: 'rect' as const },
			size: { width: 100, height: 40 },
		}
		const notation = {
			id: 'mine',
			label: () => 'Моя',
			nodeKinds: { mine: kind },
			edgeKinds: {},
			defaultNodeKind: 'mine',
		}
		mountMap({
			plugins: [{ name: 'n', notations: [notation] as never }],
			data: mapData({ notation: 'mine', nodes: [{ id: 'm', kind: 'mine', label: 'Свой', ...pinned(0, 0) }], edges: [] }),
		})
		expect(screen.getByRole('graphics-object', { name: /^Свой, Моё/ })).toBeInTheDocument()
	})
})

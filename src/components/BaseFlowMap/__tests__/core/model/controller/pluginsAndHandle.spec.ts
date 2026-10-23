import { nextTick, shallowRef } from 'vue'
import { map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import { useFlowMap } from '../../../../model/useFlowMap'
import { setupFlowPlugins } from '../../../../model/controller/flowPlugins'
import type { FlowMapController, FlowMapPlugin } from '../../../../types/api/flowController.types'

describe('плагины', () => {
	it('setup получает контроллер, при смене списка прежние очищаются, при размонтировании — тоже', async () => {
		const dispose = vi.fn()
		const setup = vi.fn(() => dispose)
		const plugin: FlowMapPlugin = { name: 'p', setup }
		const { props, stop, controller } = createHarness(map(), { props: { plugins: [plugin] } })
		expect(setup).toHaveBeenCalledWith(controller)
		props.plugins = [{ name: 'q' }]
		await nextTick()
		expect(dispose).toHaveBeenCalledTimes(1)
		props.plugins = [plugin]
		await nextTick()
		expect(setup).toHaveBeenCalledTimes(2)
		stop()
		expect(dispose).toHaveBeenCalledTimes(2)
	})

	it('setupFlowPlugins: плагины без setup и без очистки не мешают', () => {
		const off = setupFlowPlugins({} as FlowMapController, [{ name: 'a' }, { name: 'b', setup: () => undefined }])
		expect(() => off()).not.toThrow()
	})

	it('плагин приносит нотацию, раскладку, маршрутизатор и проверку', () => {
		const run = vi.fn(() => ({ nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } }))
		const validate = vi.fn(() => [{ level: 'warning' as const, code: 'plugin-check', message: 'm' }])
		const plugin: FlowMapPlugin = {
			name: 'full',
			layouts: [{ id: 'mine', run }],
			routers: [{ id: 'mine', route: () => [] }],
			validators: [validate],
			notations: [
				{
					id: 'extra',
					label: () => 'Extra',
					nodeKinds: { x: { label: () => 'X', render: 'html', shape: { shape: 'rect' }, size: { width: 10, height: 10 } } },
					edgeKinds: {},
					defaultNodeKind: 'x',
					defaultEdgeKind: 'y',
				},
			],
		}
		const { model, controller } = createHarness(
			map({ notation: 'extra', layout: { algorithm: 'mine' }, nodes: [node('a', { kind: 'x' })] }),
			{
				props: { plugins: [plugin] },
			},
		)
		expect(model.notation.value.id).toBe('extra')
		expect(model.layout.value.bounds.width).toBe(0)
		expect(run).toHaveBeenCalled()
		expect(controller.validate().map(item => item.code)).toContain('plugin-check')
		expect(validate).toHaveBeenCalled()
	})

	it('пользовательские нотации из пропса notations подключаются', () => {
		const extra = { id: 'mine', label: () => 'Mine', nodeKinds: {}, edgeKinds: {}, defaultNodeKind: 'x', defaultEdgeKind: 'y' }
		const { model } = createHarness(map({ notation: 'mine' }), { props: { notations: [extra] } })
		expect(model.notation.value.id).toBe('mine')
	})
})

describe('useFlowMap: хэндл до готовности карты', () => {
	function fakeController() {
		return {
			addNode: vi.fn(async () => ({ isApplied: true, changes: [] })),
			on: vi.fn(() => vi.fn()),
			getData: vi.fn(() => ({ version: 1 })),
		} as unknown as FlowMapController
	}

	it('вызовы до монтирования ждут в очереди и уходят в контроллер, когда он появился', () => {
		const mapRef = shallowRef<FlowMapController | null>(null)
		const handle = useFlowMap(mapRef)
		expect(handle.isReady.value).toBe(false)
		expect(handle.addNode(node('a'))).toBeUndefined()
		const controller = fakeController()
		mapRef.value = controller
		expect(controller.addNode).toHaveBeenCalledWith(node('a'))
		expect(handle.isReady.value).toBe(true)
		expect(handle.mapRef).toBe(mapRef)
	})

	it('после готовности вызовы идут сразу и возвращают результат', () => {
		const controller = fakeController()
		const handle = useFlowMap(shallowRef<FlowMapController | null>(controller))
		expect(handle.getData()).toEqual({ version: 1 })
		expect(Symbol.iterator in Object(handle) || typeof (handle as never as Record<symbol, unknown>)[Symbol.iterator]).toBeTruthy()
	})

	it('подписка on до готовности откладывается; отписка до готовности отменяет её', () => {
		const mapRef = shallowRef<FlowMapController | null>(null)
		const handle = useFlowMap(mapRef)
		const handler = vi.fn()
		const kept = handle.on('change', handler)
		const cancelled = handle.on('ready', handler)
		cancelled()
		const controller = fakeController()
		mapRef.value = controller
		expect(controller.on).toHaveBeenCalledTimes(1)
		expect(controller.on).toHaveBeenCalledWith('change', handler)
		kept()
	})

	it('подписка после готовности и отписка после подписки', () => {
		const controller = fakeController()
		const handle = useFlowMap(shallowRef<FlowMapController | null>(controller))
		const off = handle.on('change', vi.fn())
		expect(controller.on).toHaveBeenCalledTimes(1)
		expect(typeof off).toBe('function')
		const mapRef = shallowRef<FlowMapController | null>(null)
		const delayed = useFlowMap(mapRef)
		const disposeLater = delayed.on('change', vi.fn())
		mapRef.value = controller
		disposeLater()
		expect(controller.on).toHaveBeenCalledTimes(2)
	})

	it('без аргумента хэндл заводит свою ссылку', () => {
		const handle = useFlowMap()
		expect(handle.mapRef.value).toBeNull()
		expect(handle.isReady.value).toBe(false)
	})

	it('символьные ключи хэндла пусты', () => {
		const handle = useFlowMap()
		expect((handle as never as Record<symbol, unknown>)[Symbol('x')]).toBeUndefined()
	})
})

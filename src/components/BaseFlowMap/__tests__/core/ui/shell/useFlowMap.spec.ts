import '@testing-library/jest-dom/vitest'
import { mapData } from '../flowUi'
import { render } from '@testing-library/vue'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { useFlowMap } from '../../../../model/useFlowMap'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import type { FlowMapController } from '../../../../types/api/flowController.types'

function fake() {
	return {
		fitView: vi.fn(() => 'fit'),
		getViewport: vi.fn(() => ({ x: 1, y: 2, zoom: 3 })),
		on: vi.fn(() => vi.fn()),
	} as unknown as FlowMapController & Record<'fitView' | 'getViewport' | 'on', ReturnType<typeof vi.fn>>
}

describe('useFlowMap', () => {
	it('вызовы до готовности карты встают в очередь и выполняются по порядку', () => {
		const ref = shallowRef<FlowMapController | null>(null)
		const handle = useFlowMap(ref)
		expect(handle.isReady.value).toBe(false)
		expect(handle.fitView({ padding: 5 })).toBeUndefined()
		handle.getViewport()
		const controller = fake()
		ref.value = controller
		expect(handle.isReady.value).toBe(true)
		expect(controller.fitView).toHaveBeenCalledWith({ padding: 5 })
		expect(controller.getViewport).toHaveBeenCalledTimes(1)
		expect(handle.fitView()).toBe('fit')
		expect(controller.fitView).toHaveBeenCalledTimes(2)
	})

	it('очередь выполняется один раз', () => {
		const ref = shallowRef<FlowMapController | null>(null)
		const handle = useFlowMap(ref)
		handle.fitView()
		const first = fake()
		ref.value = first
		ref.value = null
		const second = fake()
		ref.value = second
		expect(first.fitView).toHaveBeenCalledTimes(1)
		expect(second.fitView).not.toHaveBeenCalled()
	})

	it('если карта уже готова, вызов идёт сразу', () => {
		const controller = fake()
		const handle = useFlowMap(shallowRef<FlowMapController | null>(controller))
		expect(handle.isReady.value).toBe(true)
		expect(handle.getViewport()).toEqual({ x: 1, y: 2, zoom: 3 })
	})

	it('on до готовности подписывается позже, отписка до готовности отменяет подписку', () => {
		const ref = shallowRef<FlowMapController | null>(null)
		const handle = useFlowMap(ref)
		const handler = vi.fn()
		const dispose = vi.fn()
		const off = handle.on('node-click', handler)
		const cancelled = handle.on('node-leave', handler)
		cancelled()
		const controller = fake()
		controller.on.mockReturnValue(dispose)
		ref.value = controller
		expect(controller.on).toHaveBeenCalledTimes(1)
		expect(controller.on).toHaveBeenCalledWith('node-click', handler)
		off()
		expect(dispose).toHaveBeenCalledTimes(1)
	})

	it('on при готовой карте возвращает отписку контроллера; отписка отложенной после готовности безопасна', () => {
		const controller = fake()
		const dispose = vi.fn()
		controller.on.mockReturnValue(dispose)
		const handle = useFlowMap(shallowRef<FlowMapController | null>(controller))
		handle.on('ready', vi.fn())()
		expect(dispose).toHaveBeenCalledTimes(1)
		const late = useFlowMap()
		const off = late.on('ready', vi.fn())
		expect(() => off()).not.toThrow()
	})

	it('несуществующие и символьные ключи не ломают дескриптор', () => {
		const handle = useFlowMap()
		expect(handle.mapRef.value).toBeNull()
		expect((handle as unknown as Record<symbol, unknown>)[Symbol.iterator]).toBeUndefined()
	})

	it('с настоящей картой: ref ловит контроллер, очередь выполняется после монтирования', async () => {
		const handle = useFlowMap()
		const queued = handle.getViewport()
		expect(queued).toBeUndefined()
		const seen = vi.fn()
		handle.on('ready', seen)
		const Host = defineComponent({
			setup: () => () => h(BaseFlowMap, { ref: handle.mapRef as never, data: mapData() }),
		})
		render(Host)
		await nextTick()
		expect(handle.isReady.value).toBe(true)
		expect(handle.getViewport()).toEqual(expect.objectContaining({ zoom: expect.any(Number) }))
		expect(handle.getBindings()).toEqual([expect.objectContaining({ name: 'ready' })])
	})
})

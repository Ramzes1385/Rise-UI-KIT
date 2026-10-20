import type { VNode } from 'vue'
import type { Camera, Scene } from 'three'
import BaseFlowMap3D from '../../ui/BaseFlowMap3D.vue'
import { render, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { loadEditUi } from '../../ui/lazy/flowMap3dLazyLoaders'
import { afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import type { BaseFlowMap3DExpose } from '../../types/BaseFlowMap3D.types'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'
import { createFakeRenderer, TestResizeObserver } from '@components/BaseImageMap3D/__tests__/imageMap3d.test-utils'

export { createFakeRenderer, TestResizeObserver }

function canvas2dStub(): CanvasRenderingContext2D {
	return new Proxy({} as Record<string, unknown>, {
		get: (target, key: string) => {
			if (key === 'measureText') return () => ({ width: 40 })
			if (key === 'getImageData') return () => ({ data: [90, 120, 200, 255] })
			if (!(key in target)) target[key] = vi.fn()
			return target[key]
		},
		set: (target, key: string, value) => {
			target[key] = value
			return true
		},
	}) as unknown as CanvasRenderingContext2D
}

export function mockWebGL(isSupported: boolean): { loseContext: ReturnType<typeof vi.fn> } {
	const loseContext = vi.fn()
	const gl = { getExtension: () => ({ loseContext }) }
	const flat = canvas2dStub()
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => {
		if (type === '2d') return flat
		return isSupported && type === 'webgl2' ? gl : null
	}) as never)
	return { loseContext }
}

export const FLOW_3D: FlowMapData = {
	version: 1,
	title: 'Оформление заказа',
	nodes: [
		{ id: 'api', label: 'Шлюз API', kind: 'service', group: 'back' },
		{ id: 'queue', label: 'Очередь', kind: 'queue', group: 'back' },
		{ id: 'db', label: 'База данных', kind: 'database', group: 'data' },
		{ id: 'cache', label: 'Кеш', kind: 'cache' },
	],
	edges: [
		{ id: 'api-queue', source: 'api', target: 'queue' },
		{ id: 'queue-db', source: 'queue', target: 'db' },
		{ id: 'api-cache', source: 'api', target: 'cache' },
	],
	groups: [
		{ id: 'back', kind: 'zone', label: 'Бэкенд' },
		{ id: 'data', kind: 'zone', label: 'Данные' },
	],
}

type FrameCallback = Parameters<typeof requestAnimationFrame>[0]

const SIZE = { width: 900, height: 560 }

function createFrameQueue() {
	let frames: Map<number, FrameCallback> = new Map()
	let counter = 0
	let now = 0
	return {
		reset(): void {
			frames = new Map()
			counter = 0
			now = 0
		},
		request(callback: FrameCallback): number {
			counter += 1
			frames.set(counter, callback)
			return counter
		},
		cancel: (id: number): boolean => frames.delete(id),
		flush(ms: number): void {
			const queue = [...frames.values()]
			frames = new Map()
			now += ms
			queue.forEach(callback => callback(now))
		},
		size: (): number => frames.size,
	}
}

function rectOf(size: { width: number; height: number }): DOMRect {
	return { left: 0, top: 0, right: size.width, bottom: size.height, ...size, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
}

function stubBrowser(size: { width: number; height: number }, queue: ReturnType<typeof createFrameQueue>): void {
	TestResizeObserver.instances = []
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal('requestAnimationFrame', queue.request)
	vi.stubGlobal('cancelAnimationFrame', queue.cancel)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => size.width)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => size.height)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => rectOf(size))
	document.documentElement.setAttribute('data-rise-motion', 'none')
	mockWebGL(true)
}

type RenderSlots = Record<string, (props: never) => VNode | VNode[]>

function createHost(parts: {
	renderer: ReturnType<typeof createFakeRenderer>
	slots: RenderSlots
	onController: (value: BaseFlowMap3DExpose) => void
}) {
	const exposed = ref<BaseFlowMap3DExpose | null>(null)
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(
					BaseFlowMap3D,
					{
						data: FLOW_3D,
						rendererFactory: () => parts.renderer,
						...attrs,
						onReady: (value: BaseFlowMap3DExpose) => {
							parts.onController(value)
							;(attrs.onReady as ((value: BaseFlowMap3DExpose) => void) | undefined)?.(value)
						},
						ref: exposed,
					},
					parts.slots,
				),
	})
	return { Host, exposed }
}

export function useFlowMap3DEnvironment() {
	const queue = createFrameQueue()
	const size = { ...SIZE }
	const flushFrames = (ms = 16): void => queue.flush(ms)

	beforeAll(warmTwoD, 60_000)

	beforeEach(() => {
		queue.reset()
		size.width = SIZE.width
		size.height = SIZE.height
		stubBrowser(size, queue)
	})

	afterEach(async () => {
		await vi.dynamicImportSettled()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	const setMotion = (preset: 'none' | 'subtle' | 'standard' | 'expressive'): void =>
		document.documentElement.setAttribute('data-rise-motion', preset)

	async function renderMap(props: Record<string, unknown> = {}, slots: RenderSlots = {}, options: { isRenderer?: boolean } = {}) {
		const renderer = createFakeRenderer()
		let controller: BaseFlowMap3DExpose | null = null
		const { Host, exposed } = createHost({ renderer, slots, onController: value => (controller = value) })
		const result = render(Host, { attrs: props })
		if (props.view !== '2d' && options.isRenderer !== false) await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
		await nextTick()
		flushFrames()
		const camera = (): Camera => renderer.render.mock.calls.at(-1)?.[1] as Camera
		const scene = (): Scene => renderer.render.mock.calls.at(-1)?.[0] as Scene
		return { ...result, renderer, exposed, camera, scene, api: () => controller as BaseFlowMap3DExpose }
	}

	return { size, flushFrames, renderMap, setMotion, pending: queue.size }
}

async function warmTwoD(): Promise<void> {
	await Promise.all([
		import('@components/BaseFlowMap/ui/BaseFlowMap.vue'),
		import('@components/BaseFlowMap/ui/scenario/FlowScenarioPanel.vue'),
		import('@components/BaseFlowMap/ui/panels/FlowDetails.vue'),
		import('@components/BaseFlowMap/ui/panels/FlowLegend.vue'),
		import('@components/BaseFlowMap/model/scenario/useFlowScenario'),
		import('../../model/edit/useFlowMap3DEditKit'),
		loadEditUi(),
	])
}

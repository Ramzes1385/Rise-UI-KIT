import { render } from '@testing-library/vue'
import { Mesh, PerspectiveCamera } from 'three'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { Scene3DRenderer } from '../../types/scene3d.types'
import { useScene3DViewport } from '../../renderer/useScene3DViewport'
import type { Scene3DCameraKind } from '../../types/internal/scene3dInternal.types'

let frames: Map<number, FrameRequestCallback>
let nextId: number
let observers: Array<{ callback: ResizeObserverCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }>

const flush = () => {
	const due = [...frames.values()]
	frames.clear()
	due.forEach(callback => callback(16))
}

beforeEach(() => {
	frames = new Map()
	nextId = 0
	observers = []
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		nextId += 1
		frames.set(nextId, callback)
		return nextId
	})
	vi.stubGlobal('cancelAnimationFrame', (id: number) => void frames.delete(id))
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe = vi.fn()
			disconnect = vi.fn()
			callback: ResizeObserverCallback
			constructor(callback: ResizeObserverCallback) {
				this.callback = callback
				observers.push(this)
			}
		},
	)
	vi.stubGlobal('IntersectionObserver', undefined)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

function fakeRenderer(): Scene3DRenderer {
	return {
		domElement: document.createElement('canvas'),
		setPixelRatio: vi.fn(),
		setSize: vi.fn(),
		render: vi.fn(),
		dispose: vi.fn(),
		forceContextLoss: vi.fn(),
	}
}

function mountViewport(factory: (canvas: HTMLCanvasElement) => Scene3DRenderer = () => fakeRenderer()) {
	const canvasRef = ref<HTMLCanvasElement | null>(null)
	const hostRef = ref<HTMLElement | null>(null)
	const kind = ref<Scene3DCameraKind>('isometric')
	const options = { canvasRef, hostRef, fit: vi.fn(), getFactory: () => factory, getCameraKind: () => kind.value, onError: vi.fn() }
	let api!: ReturnType<typeof useScene3DViewport>
	const view = render(
		defineComponent({
			setup() {
				api = useScene3DViewport(options)
				return () => h('div')
			},
		}),
	)
	const canvas = document.createElement('canvas')
	const host = document.createElement('div')
	async function open() {
		hostRef.value = host
		canvasRef.value = canvas
		await nextTick()
	}
	return { api, view, options, kind, canvas, host, canvasRef, hostRef, open }
}

describe('useScene3DViewport: запуск', () => {
	it('рендерер создаётся на холсте, подгонка и размер по хосту, кадр запрошен', async () => {
		const factory = vi.fn(() => fakeRenderer())
		const viewport = mountViewport(factory)
		await viewport.open()
		const renderer = viewport.api.renderer.value as Scene3DRenderer
		expect(factory).toHaveBeenCalledWith(viewport.canvas)
		expect(renderer.setSize).toHaveBeenCalledWith(400, 300, false)
		expect(viewport.options.fit).toHaveBeenCalledWith(viewport.api.camera.value, { width: 400, height: 300 })
		expect(viewport.api.fitted.value).toBe(1)
		expect(frames.size).toBe(1)
		flush()
		expect(renderer.render).toHaveBeenCalledWith(viewport.api.scene, viewport.api.camera.value)
	})

	it('плотность пикселей ограничена 2, нулевая — 1', async () => {
		vi.stubGlobal('devicePixelRatio', 3)
		const high = mountViewport()
		await high.open()
		expect(high.api.renderer.value?.setPixelRatio).toHaveBeenCalledWith(2)
		vi.stubGlobal('devicePixelRatio', 0)
		const none = mountViewport()
		await none.open()
		expect(none.api.renderer.value?.setPixelRatio).toHaveBeenCalledWith(1)
	})

	it('без хоста рендерер не создаётся', async () => {
		const factory = vi.fn(() => fakeRenderer())
		const viewport = mountViewport(factory)
		viewport.canvasRef.value = viewport.canvas
		await nextTick()
		expect(factory).not.toHaveBeenCalled()
	})

	it('фабрика бросила: onError, рендерера нет, наблюдателя нет', async () => {
		const error = new Error('нет WebGL')
		const viewport = mountViewport(() => {
			throw error
		})
		await viewport.open()
		expect(viewport.options.onError).toHaveBeenCalledWith(error)
		expect(viewport.api.renderer.value).toBeNull()
		expect(observers).toHaveLength(0)
	})

	it('пустая область размер не меняет', async () => {
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(0)
		const viewport = mountViewport()
		await viewport.open()
		expect(viewport.api.renderer.value?.setSize).not.toHaveBeenCalled()
		expect(viewport.api.fitted.value).toBe(0)
	})
})

describe('useScene3DViewport: размер и камера', () => {
	it('ResizeObserver подгоняет камеру и просит кадр', async () => {
		const viewport = mountViewport()
		await viewport.open()
		flush()
		expect(observers[0].observe).toHaveBeenCalledWith(viewport.host)
		observers[0].callback([{ contentRect: { width: 800, height: 600 } } as ResizeObserverEntry], {} as ResizeObserver)
		expect(viewport.api.renderer.value?.setSize).toHaveBeenLastCalledWith(800, 600, false)
		expect(viewport.options.fit).toHaveBeenLastCalledWith(viewport.api.camera.value, { width: 800, height: 600 })
		expect(viewport.api.fitted.value).toBe(2)
		expect(frames.size).toBe(1)
	})

	it('refit берёт текущий размер хоста; без хоста не делает ничего', async () => {
		const viewport = mountViewport()
		await viewport.open()
		viewport.api.refit()
		expect(viewport.api.fitted.value).toBe(2)
		viewport.hostRef.value = null
		viewport.api.refit()
		expect(viewport.api.fitted.value).toBe(2)
	})

	it('смена вида камеры создаёт новую камеру и подгоняет её', async () => {
		const viewport = mountViewport()
		await viewport.open()
		const before = viewport.api.camera.value
		viewport.kind.value = 'perspective'
		await nextTick()
		expect(viewport.api.camera.value).not.toBe(before)
		expect(viewport.api.camera.value).toBeInstanceOf(PerspectiveCamera)
		expect(viewport.options.fit).toHaveBeenLastCalledWith(viewport.api.camera.value, { width: 400, height: 300 })
	})
})

describe('useScene3DViewport: контекст и освобождение', () => {
	it('контекст потерян и не вернулся за 3 с — onError; вернулся — кадр', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const viewport = mountViewport()
		await viewport.open()
		flush()
		const dom = (viewport.api.renderer.value as Scene3DRenderer).domElement
		dom.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
		vi.advanceTimersByTime(3000)
		expect(viewport.options.onError).toHaveBeenCalledWith(new Error('WebGL context lost'))
		dom.dispatchEvent(new Event('webglcontextrestored'))
		expect(frames.size).toBe(1)
	})

	it('холст убран: рендерер освобождён, сцена очищена, наблюдатель отключён', async () => {
		const viewport = mountViewport()
		await viewport.open()
		const renderer = viewport.api.renderer.value as Scene3DRenderer
		viewport.api.scene.add(new Mesh())
		viewport.canvasRef.value = null
		await nextTick()
		expect(renderer.dispose).toHaveBeenCalled()
		expect(renderer.forceContextLoss).toHaveBeenCalled()
		expect(viewport.api.renderer.value).toBeNull()
		expect(viewport.api.scene.children).toHaveLength(0)
		expect(observers[0].disconnect).toHaveBeenCalled()
	})

	it('новый холст пересоздаёт рендерер', async () => {
		const factory = vi.fn(() => fakeRenderer())
		const viewport = mountViewport(factory)
		await viewport.open()
		viewport.canvasRef.value = document.createElement('canvas')
		await nextTick()
		expect(factory).toHaveBeenCalledTimes(2)
		expect(observers[0].disconnect).toHaveBeenCalled()
	})

	it('размонтирование освобождает всё', async () => {
		const viewport = mountViewport()
		await viewport.open()
		const renderer = viewport.api.renderer.value as Scene3DRenderer
		viewport.view.unmount()
		expect(renderer.dispose).toHaveBeenCalled()
		expect(viewport.api.renderer.value).toBeNull()
	})

	it('onFrame, onBeforeRender и animate доступны из цикла', async () => {
		const viewport = mountViewport()
		await viewport.open()
		const [after, before, tick] = [vi.fn(), vi.fn(), vi.fn(() => false as const)]
		viewport.api.onFrame(after)
		viewport.api.onBeforeRender(before)
		viewport.api.animate(tick)
		flush()
		expect([after, before, tick].every(spy => spy.mock.calls.length > 0)).toBe(true)
	})
})

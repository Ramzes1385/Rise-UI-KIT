import { Scene, PerspectiveCamera } from 'three'
import { useRenderLoop } from '../../loop/useRenderLoop'
import type { RenderLoopOptions } from '../../types/internal/scene3dInternal.types'

let callbacks: Map<number, FrameRequestCallback>
let nextId: number
let now: number

function flush(step = 16): void {
	const due = [...callbacks.entries()]
	callbacks.clear()
	now += step
	due.forEach(([, callback]) => callback(now))
}

function fakeRenderer() {
	return {
		domElement: document.createElement('canvas'),
		setPixelRatio: vi.fn(),
		setSize: vi.fn(),
		render: vi.fn(),
		dispose: vi.fn(),
		forceContextLoss: vi.fn(),
	}
}

const loops: Array<{ release: () => void }> = []

function setup(options?: RenderLoopOptions) {
	const scene = new Scene()
	const camera = new PerspectiveCamera()
	const loop = useRenderLoop(scene, () => camera, options)
	loops.push(loop)
	const renderer = fakeRenderer()
	loop.renderer.value = renderer
	return { loop, renderer, scene, camera }
}

function setHidden(value: boolean) {
	vi.spyOn(document, 'hidden', 'get').mockReturnValue(value)
	document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
	callbacks = new Map()
	nextId = 0
	now = 1000
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		nextId += 1
		callbacks.set(nextId, callback)
		return nextId
	})
	vi.stubGlobal('cancelAnimationFrame', (id: number) => void callbacks.delete(id))
	vi.stubGlobal('IntersectionObserver', undefined)
})

afterEach(() => {
	loops.splice(0).forEach(loop => loop.release())
	vi.unstubAllGlobals()
})

describe('useRenderLoop: кадры по требованию', () => {
	it('без рендерера кадр не запрашивается', () => {
		const loop = useRenderLoop(new Scene(), () => new PerspectiveCamera())
		loop.invalidate()
		expect(callbacks.size).toBe(0)
	})

	it('invalidate склеивает запросы в один кадр, кадр рисует сцену камерой getCamera', () => {
		const { loop, renderer, scene, camera } = setup()
		loop.invalidate()
		loop.invalidate()
		expect(callbacks.size).toBe(1)
		flush()
		expect(renderer.render).toHaveBeenCalledExactlyOnceWith(scene, camera)
		expect(callbacks.size).toBe(0)
		loop.invalidate()
		expect(callbacks.size).toBe(1)
	})

	it('onBeforeRender получает кадр до отрисовки, onFrame — после; отписка работает дважды без вреда', () => {
		const { loop, renderer } = setup()
		const order: string[] = []
		renderer.render.mockImplementation(() => order.push('render'))
		const before = vi.fn(() => order.push('before'))
		const after = vi.fn(() => order.push('after'))
		const offBefore = loop.onBeforeRender(before)
		const offAfter = loop.onFrame(after)
		loop.invalidate()
		flush()
		expect(order).toEqual(['before', 'render', 'after'])
		expect(before).toHaveBeenCalledWith({ delta: 0, time: 0 })
		offBefore()
		offBefore()
		offAfter()
		loop.invalidate()
		flush()
		expect(before).toHaveBeenCalledTimes(1)
		expect(after).toHaveBeenCalledTimes(1)
	})

	it('кадр, который успел запросить удалённый рендерер, ничего не рисует', () => {
		const { loop, renderer } = setup()
		loop.invalidate()
		loop.renderer.value = null
		flush()
		expect(renderer.render).not.toHaveBeenCalled()
	})
})

describe('useRenderLoop: animate', () => {
	it('кадры идут, пока tick не вернёт false; шаг и время растут, потом цикл замирает', () => {
		const { loop, renderer } = setup()
		const frames: Array<[number, number]> = []
		let count = 0
		loop.animate((delta, time) => {
			frames.push([delta, time])
			count += 1
			return count < 3 ? undefined : false
		})
		expect(callbacks.size).toBe(1)
		flush()
		flush()
		flush()
		expect(frames).toHaveLength(3)
		expect(frames[0]).toEqual([0, 0])
		expect(frames[1][0]).toBeCloseTo(0.016)
		expect(frames[2][1]).toBeCloseTo(0.032)
		expect(renderer.render).toHaveBeenCalledTimes(3)
		expect(callbacks.size).toBe(0)
	})

	it('отписка снимает анимацию', () => {
		const { loop } = setup()
		const tick = vi.fn()
		const stop = loop.animate(tick)
		flush()
		stop()
		flush()
		expect(tick).toHaveBeenCalledTimes(1)
		expect(callbacks.size).toBe(0)
	})

	it('после остановки анимаций часы сброшены: следующий запуск начинается с шага 0', () => {
		const { loop } = setup()
		const first = vi.fn(() => false as const)
		loop.animate(first)
		flush()
		now += 10_000
		const second = vi.fn()
		loop.animate(second)
		flush()
		expect(second).toHaveBeenCalledWith(0, expect.any(Number))
	})

	it('«уменьшить движение»: tick один раз с нулями, один кадр, отписка пустая', () => {
		const { loop, renderer } = setup({ isReducedMotion: () => true })
		const tick = vi.fn()
		const stop = loop.animate(tick)
		expect(tick).toHaveBeenCalledExactlyOnceWith(0, 0)
		expect(callbacks.size).toBe(1)
		flush()
		flush()
		expect(tick).toHaveBeenCalledTimes(1)
		expect(renderer.render).toHaveBeenCalledTimes(1)
		expect(stop()).toBeUndefined()
	})
})

describe('useRenderLoop: пауза', () => {
	it('вкладка скрыта — непрерывные кадры стоят, вернулась — продолжаются со сброшенными часами', () => {
		const { loop } = setup()
		const tick = vi.fn()
		loop.animate(tick)
		flush()
		expect(callbacks.size).toBe(1)
		setHidden(true)
		flush()
		expect(callbacks.size).toBe(0)
		const calls = tick.mock.calls.length
		setHidden(false)
		expect(callbacks.size).toBe(1)
		now += 60_000
		flush()
		expect(tick.mock.calls.length).toBe(calls + 1)
		expect(tick.mock.calls[calls][0]).toBe(0)
	})

	it('пауза не мешает разовому кадру invalidate', () => {
		const { loop, renderer } = setup()
		setHidden(true)
		loop.invalidate()
		flush()
		expect(renderer.render).toHaveBeenCalledTimes(1)
	})

	it('наблюдатель следит за холстом рендерера, getHost подменяет хост', () => {
		const observe = vi.fn()
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				observe = observe
				disconnect = vi.fn()
			},
		)
		const first = setup()
		first.loop.animate(vi.fn())
		expect(observe).toHaveBeenCalledWith(first.renderer.domElement)
		first.loop.release()
		const host = document.createElement('div')
		const second = setup({ getHost: () => host })
		second.loop.animate(vi.fn())
		expect(observe).toHaveBeenLastCalledWith(host)
		second.loop.release()
	})
})

describe('useRenderLoop: release', () => {
	it('отменяет кадр, освобождает рендерер и контекст, снимает анимации', () => {
		const { loop, renderer } = setup()
		const tick = vi.fn()
		loop.animate(tick)
		loop.release()
		expect(callbacks.size).toBe(0)
		expect(renderer.dispose).toHaveBeenCalled()
		expect(renderer.forceContextLoss).toHaveBeenCalled()
		expect(loop.renderer.value).toBeNull()
		loop.invalidate()
		expect(callbacks.size).toBe(0)
		expect(tick).not.toHaveBeenCalled()
	})

	it('release без рендерера не падает', () => {
		const loop = useRenderLoop(new Scene(), () => new PerspectiveCamera())
		expect(() => loop.release()).not.toThrow()
	})
})

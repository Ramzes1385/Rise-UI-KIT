import '@testing-library/jest-dom/vitest'
import { runInHost, stubFrame } from '../flowUi'
import { effectScope, nextTick, ref } from 'vue'
import { useFlowFrame } from '../../../../model/viewport/useFlowFrame'
import { useFlowVisibility } from '../../../../model/viewport/useFlowVisibility'
import { createViewportAnimation } from '../../../../model/viewport/useFlowAnimation'
import { boundsOf, centerViewport, clampZoom, fitViewport, isRevealed, mixViewport, zoomAt } from '../../../../model/viewport/viewGeometry'

const limits = { min: 0.2, max: 3 }

describe('геометрия вида', () => {
	it('clampZoom держит масштаб в пределах', () => {
		expect([clampZoom(0.01, limits), clampZoom(1, limits), clampZoom(50, limits)]).toEqual([0.2, 1, 3])
	})

	it('zoomAt сохраняет точку под указателем неподвижной', () => {
		const next = zoomAt({ x: 10, y: 20, zoom: 1 }, { factor: 2, anchor: { x: 110, y: 120 } }, limits)
		expect(next).toEqual({ zoom: 2, x: -90, y: -80 })
		expect(zoomAt({ x: 0, y: 0, zoom: 3 }, { factor: 2, anchor: { x: 5, y: 5 } }, limits)).toEqual({ zoom: 3, x: 0, y: 0 })
	})

	it('centerViewport ставит центр прямоугольника в центр области', () => {
		expect(centerViewport({ x: 100, y: 100, width: 100, height: 50 }, { width: 400, height: 200 }, 2)).toEqual({
			zoom: 2,
			x: -100,
			y: -150,
		})
	})

	it('fitViewport вписывает с отступом, не увеличивает больше 100 % и не ломается на пустом', () => {
		const frame = { width: 400, height: 300 }
		const fit = { padding: 20, limits }
		expect(fitViewport({ x: 0, y: 0, width: 720, height: 100 }, frame, fit).zoom).toBeCloseTo(0.5, 5)
		expect(fitViewport({ x: 0, y: 0, width: 100, height: 100 }, frame, fit).zoom).toBe(1)
		expect(fitViewport({ x: 0, y: 0, width: 100000, height: 100 }, frame, fit).zoom).toBe(0.2)
		const empty = { x: 0, y: 0, zoom: 1 }
		expect(fitViewport({ x: 0, y: 0, width: 0, height: 10 }, frame, fit)).toEqual(empty)
		expect(fitViewport({ x: 0, y: 0, width: 10, height: 0 }, frame, fit)).toEqual(empty)
		expect(fitViewport({ x: 0, y: 0, width: 10, height: 10 }, { width: 0, height: 10 }, fit)).toEqual(empty)
		expect(fitViewport({ x: 0, y: 0, width: 10, height: 10 }, { width: 10, height: 0 }, fit)).toEqual(empty)
	})

	it('boundsOf объединяет прямоугольники, для пустого списка — null', () => {
		expect(boundsOf([])).toBeNull()
		expect(
			boundsOf([
				{ x: 10, y: 10, width: 10, height: 10 },
				{ x: 50, y: 0, width: 10, height: 20 },
			]),
		).toEqual({ x: 10, y: 0, width: 50, height: 20 })
	})

	it('mixViewport смешивает по прогрессу', () => {
		expect(mixViewport({ x: 0, y: 0, zoom: 1 }, { x: 10, y: 20, zoom: 3 }, 0.5)).toEqual({ x: 5, y: 10, zoom: 2 })
	})

	it('isRevealed видит прямоугольник, глубоко внутри видимой области, и не видит у самого края и за ним', () => {
		const frame = { width: 200, height: 200 }
		const view = { x: 0, y: 0, zoom: 1 }
		expect(isRevealed({ x: 50, y: 50, width: 20, height: 20 }, view, frame)).toBe(true)
		expect(isRevealed({ x: 190, y: 50, width: 20, height: 20 }, view, frame)).toBe(false)
		expect(isRevealed({ x: -30, y: 50, width: 20, height: 20 }, view, frame)).toBe(false)
		expect(isRevealed({ x: 50, y: -30, width: 20, height: 20 }, view, frame)).toBe(false)
		expect(isRevealed({ x: 50, y: 190, width: 20, height: 20 }, view, frame)).toBe(false)
	})
})

describe('useFlowFrame', () => {
	it('измеряет элемент при подключении и обновляет только при изменении размера', () => {
		stubFrame(500, 300)
		const { value: frame } = runInHost(() => useFlowFrame({ compactBreakpoint: 640 }))
		const element = document.createElement('div')
		frame.attach(element)
		expect(frame.frame.value).toEqual({ width: 500, height: 300 })
		const same = frame.frame.value
		frame.attach(element)
		expect(frame.frame.value).toBe(same)
		expect(frame.isCompact.value).toBe(true)
	})

	it('не считает карту компактной без размера и при ширине от порога; порог по умолчанию — 640', () => {
		const { value: frame } = runInHost(() => useFlowFrame({}))
		expect(frame.isCompact.value).toBe(false)
		stubFrame(639)
		frame.attach(document.createElement('div'))
		expect(frame.isCompact.value).toBe(true)
		stubFrame(640)
		frame.attach(document.createElement('div'))
		expect(frame.isCompact.value).toBe(false)
	})

	it('отключение элемента сбрасывает наблюдатель и ничего не измеряет', () => {
		const observers: { disconnect: ReturnType<typeof vi.fn> }[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				disconnect = vi.fn()
				constructor() {
					observers.push(this)
				}
				observe() {}
			},
		)
		const { value: frame, unmount } = runInHost(() => useFlowFrame({ compactBreakpoint: 640 }))
		frame.attach('не элемент')
		expect(observers).toHaveLength(0)
		frame.attach(document.createElement('div'))
		frame.attach(null)
		expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
		expect(frame.element.value).toBeNull()
		frame.attach(document.createElement('div'))
		unmount()
		expect(observers[1].disconnect).toHaveBeenCalledTimes(1)
		vi.unstubAllGlobals()
	})

	it('без ResizeObserver измерение делается один раз', () => {
		vi.stubGlobal('ResizeObserver', undefined)
		stubFrame(300, 200)
		const { value: frame } = runInHost(() => useFlowFrame({ compactBreakpoint: 640 }))
		frame.attach(document.createElement('div'))
		expect(frame.frame.value).toEqual({ width: 300, height: 200 })
		vi.unstubAllGlobals()
	})

	it('при смене размера наблюдатель пересчитывает кадр, а без элемента ничего не делает', () => {
		const callbacks: (() => void)[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: () => void) {
					callbacks.push(callback)
				}
				observe() {}
				disconnect() {}
			},
		)
		stubFrame(300, 200)
		const { value: frame } = runInHost(() => useFlowFrame({ compactBreakpoint: 640 }))
		frame.attach(document.createElement('div'))
		stubFrame(900, 200)
		callbacks[0]()
		expect(frame.frame.value.width).toBe(900)
		frame.element.value = null
		callbacks[0]()
		expect(frame.frame.value.width).toBe(900)
		vi.unstubAllGlobals()
	})
})

describe('useFlowVisibility', () => {
	const setHidden = (isHidden: boolean) => vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(isHidden ? 'hidden' : 'visible')

	it('скрытая вкладка выключает видимость, возврат включает', async () => {
		const element = ref<HTMLElement | null>(document.createElement('div'))
		const { value } = runInHost(() => useFlowVisibility(element))
		expect(value.isVisible.value).toBe(true)
		setHidden(true)
		document.dispatchEvent(new Event('visibilitychange'))
		expect(value.isVisible.value).toBe(false)
		setHidden(false)
		document.dispatchEvent(new Event('visibilitychange'))
		await nextTick()
		expect(value.isVisible.value).toBe(true)
	})

	it('учитывает пересечение с окном просмотра и отключает наблюдение при размонтировании', () => {
		const callbacks: ((entries: { isIntersecting: boolean }[]) => void)[] = []
		const disconnect = vi.fn()
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
					callbacks.push(callback)
				}
				observe() {}
				disconnect = disconnect
			},
		)
		const element = ref<HTMLElement | null>(document.createElement('div'))
		const { value, unmount } = runInHost(() => useFlowVisibility(element))
		callbacks[0]([{ isIntersecting: false }])
		expect(value.isVisible.value).toBe(false)
		callbacks[0]([{ isIntersecting: false }, { isIntersecting: true }])
		expect(value.isVisible.value).toBe(true)
		unmount()
		expect(disconnect).toHaveBeenCalledTimes(1)
		vi.unstubAllGlobals()
	})

	it('без элемента и без IntersectionObserver остаётся видимой', () => {
		const empty = ref<HTMLElement | null>(null)
		vi.stubGlobal('IntersectionObserver', class {})
		expect(runInHost(() => useFlowVisibility(empty)).value.isVisible.value).toBe(true)
		vi.stubGlobal('IntersectionObserver', undefined)
		const filled = ref<HTMLElement | null>(document.createElement('div'))
		expect(runInHost(() => useFlowVisibility(filled)).value.isVisible.value).toBe(true)
		vi.unstubAllGlobals()
	})

	it('размонтирование без документа не падает', () => {
		const scope = effectScope()
		const element = ref<HTMLElement | null>(null)
		const { unmount } = runInHost(() => useFlowVisibility(element))
		vi.stubGlobal('document', undefined)
		expect(() => unmount()).not.toThrow()
		vi.unstubAllGlobals()
		scope.stop()
	})
})

describe('createViewportAnimation', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('проходит от начала к концу по кубической кривой и вызывает done один раз', () => {
		const viewport = ref({ x: 0, y: 0, zoom: 1 })
		const isAnimating = ref(false)
		const done = vi.fn()
		const animation = createViewportAnimation(viewport, isAnimating, done)
		animation.run({ x: 100, y: 0, zoom: 2 })
		expect(isAnimating.value).toBe(true)
		vi.advanceTimersByTime(120)
		expect(viewport.value.x).toBeCloseTo(84.8, 0)
		expect(done).not.toHaveBeenCalled()
		vi.advanceTimersByTime(200)
		expect(viewport.value).toEqual({ x: 100, y: 0, zoom: 2 })
		expect(isAnimating.value).toBe(false)
		expect(done).toHaveBeenCalledTimes(1)
		expect(done).toHaveBeenCalledWith({ x: 100, y: 0, zoom: 2 })
	})

	it('stop прекращает анимацию, повторный stop безопасен', () => {
		const viewport = ref({ x: 0, y: 0, zoom: 1 })
		const isAnimating = ref(false)
		const done = vi.fn()
		const animation = createViewportAnimation(viewport, isAnimating, done)
		animation.stop()
		animation.run({ x: 100, y: 0, zoom: 1 })
		vi.advanceTimersByTime(50)
		animation.stop()
		const stopped = viewport.value.x
		vi.advanceTimersByTime(500)
		expect(viewport.value.x).toBe(stopped)
		expect(isAnimating.value).toBe(false)
		expect(done).not.toHaveBeenCalled()
	})

	it('stop без cancelAnimationFrame только сбрасывает флаг', () => {
		const viewport = ref({ x: 0, y: 0, zoom: 1 })
		const isAnimating = ref(false)
		const animation = createViewportAnimation(viewport, isAnimating, vi.fn())
		animation.run({ x: 100, y: 0, zoom: 1 })
		vi.stubGlobal('cancelAnimationFrame', undefined)
		animation.stop()
		expect(isAnimating.value).toBe(false)
		vi.unstubAllGlobals()
	})

	it('метка кадра раньше старта не отбрасывает вид назад за начало', () => {
		vi.unstubAllGlobals()
		const callbacks: ((now: number) => void)[] = []
		vi.stubGlobal('requestAnimationFrame', (callback: (now: number) => void) => callbacks.push(callback))
		vi.stubGlobal('performance', { now: () => 1000 })
		const viewport = ref({ x: 0, y: 0, zoom: 1 })
		createViewportAnimation(viewport, ref(false), vi.fn()).run({ x: 100, y: 0, zoom: 2 })
		callbacks[0](500)
		expect(viewport.value).toEqual({ x: 0, y: 0, zoom: 1 })
		vi.unstubAllGlobals()
	})
})

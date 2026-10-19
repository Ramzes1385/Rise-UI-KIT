import '@testing-library/jest-dom/vitest'
import { runInHost, stubFrame } from '../flowUi'
import { effectScope, nextTick, reactive, ref } from 'vue'
import { useFlowFrame } from '../../../../model/viewport/useFlowFrame'
import { useFlowPanels } from '../../../../model/viewport/panels/useFlowPanels'
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

describe('useFlowFrame: compact по ширине корня минус боковые панели', () => {
	afterEach(() => vi.restoreAllMocks())

	function withRoot(widths: { root: number; area: number }) {
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
			return this.classList.contains('base-flow-map') ? widths.root : widths.area
		})
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
		const root = document.createElement('div')
		root.className = 'base-flow-map'
		const area = document.createElement('div')
		root.append(area)
		return area
	}

	it.each([
		[375, 564, true],
		[1280, 564, false],
		[900, 340, true],
	])('корень %i с панелями %i: compact = %s', (root, reserved, expected) => {
		const { value: frame } = runInHost(() => useFlowFrame({}))
		frame.reserve(() => reserved)
		frame.attach(withRoot({ root, area: 5000 }))
		expect(frame.isCompact.value).toBe(expected)
	})

	it('без корня берётся ширина области вида, резерв не вычитается', () => {
		stubFrame(700, 400)
		const { value: frame } = runInHost(() => useFlowFrame({}))
		frame.reserve(() => 564)
		frame.attach(document.createElement('div'))
		expect(frame.isCompact.value).toBe(false)
		stubFrame(600, 400)
		frame.attach(document.createElement('div'))
		expect(frame.isCompact.value).toBe(true)
	})

	it('без reserve ничего не вычитается', () => {
		const { value: frame } = runInHost(() => useFlowFrame({}))
		frame.attach(withRoot({ root: 700, area: 100 }))
		expect(frame.isCompact.value).toBe(false)
		frame.attach(withRoot({ root: 600, area: 100 }))
		expect(frame.isCompact.value).toBe(true)
	})

	it('смена reserve пересчитывает isCompact', () => {
		const { value: frame } = runInHost(() => useFlowFrame({}))
		const reserved = ref(0)
		frame.reserve(() => reserved.value)
		frame.attach(withRoot({ root: 900, area: 100 }))
		expect(frame.isCompact.value).toBe(false)
		reserved.value = 340
		expect(frame.isCompact.value).toBe(true)
		frame.reserve(() => 0)
		expect(frame.isCompact.value).toBe(false)
	})
})

describe('useFlowFrame: корень, найденный после attach', () => {
	afterEach(() => vi.restoreAllMocks())

	function observed() {
		const callbacks: (() => void)[] = []
		const targets: Element[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: () => void) {
					callbacks.push(callback)
				}
				observe(target: Element) {
					targets.push(target)
				}
				disconnect() {}
			},
		)
		return { callbacks, targets }
	}

	function sizes(widths: { root: number; area: number }) {
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
			return this.classList.contains('base-flow-map') ? widths.root : widths.area
		})
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
	}

	function detachedMap() {
		const root = document.createElement('div')
		root.className = 'base-flow-map'
		const area = document.createElement('div')
		root.append(area)
		return { root, area }
	}

	it('attach до вставки в корень: подключили корень, наблюдатель нашёл его, rootWidth вырос, isCompact = true при viewport 0', () => {
		const { callbacks, targets } = observed()
		sizes({ root: 0, area: 0 })
		const { value: frame } = runInHost(() => useFlowFrame({}))
		frame.reserve(() => 340)
		const area = document.createElement('div')
		frame.attach(area)
		expect(targets).toEqual([area])
		expect(frame.isCompact.value).toBe(false)
		const root = document.createElement('div')
		root.className = 'base-flow-map'
		root.append(area)
		document.body.append(root)
		sizes({ root: 800, area: 0 })
		callbacks[0]()
		expect(frame.frame.value).toEqual({ width: 0, height: 400 })
		expect(frame.isCompact.value).toBe(true)
		sizes({ root: 1280, area: 0 })
		callbacks[0]()
		expect(frame.isCompact.value).toBe(false)
		root.remove()
	})

	it('наблюдатель следит и за областью вида, и за найденным позже корнем, корень не наблюдается дважды', () => {
		const { callbacks, targets } = observed()
		sizes({ root: 0, area: 0 })
		const { value: frame } = runInHost(() => useFlowFrame({}))
		const area = document.createElement('div')
		frame.attach(area)
		callbacks[0]()
		expect(targets).toEqual([area])
		const root = document.createElement('div')
		root.className = 'base-flow-map'
		root.append(area)
		document.body.append(root)
		sizes({ root: 500, area: 100 })
		callbacks[0]()
		expect(targets).toEqual([area, root])
		callbacks[0]()
		expect(targets).toEqual([area, root])
		root.remove()
	})

	it('отключённый корень заменяется найденным заново, вне .base-flow-map корень не появляется', () => {
		const { callbacks, targets } = observed()
		sizes({ root: 700, area: 100 })
		const { value: frame } = runInHost(() => useFlowFrame({}))
		const first = detachedMap()
		document.body.append(first.root)
		frame.attach(first.area)
		expect(targets).toEqual([first.area, first.root])
		first.root.remove()
		first.root.append(first.area)
		callbacks[0]()
		expect(targets).toEqual([first.area, first.root])
		const second = detachedMap()
		document.body.append(second.root)
		second.root.append(first.area)
		callbacks[0]()
		expect(targets).toEqual([first.area, first.root, second.root])
		second.root.remove()
		sizes({ root: 100, area: 700 })
		const bare = document.createElement('div')
		const lone = document.createElement('div')
		document.body.append(bare)
		bare.append(lone)
		const { value: other } = runInHost(() => useFlowFrame({}))
		other.attach(lone)
		expect(other.isCompact.value).toBe(false)
		bare.remove()
	})
})

describe('useFlowPanels', () => {
	function panelsOf(mode: 'view' | 'edit' | 'review', flags: { details?: boolean; scenario?: boolean } = {}, sizeScale?: number) {
		const frame = runInHost(() => useFlowFrame({})).value
		const flag = (value = false) => ref(value)
		const parts = {
			model: { mode: ref(mode) },
			chrome: {
				hasToolbar: flag(true),
				hasMinimap: flag(true),
				hasLegend: flag(true),
				hasScenario: flag(flags.scenario),
				hasDetails: flag(flags.details),
			},
			state: { isEditing: flag(), isCompact: flag(), isGridOn: flag(true) },
			frame,
		}
		const props = reactive<{ sizeScale?: number }>({ sizeScale })
		const panels = runInHost(() => useFlowPanels(props as never, parts as never)).value
		return { frame, panels, parts, props }
	}

	const compactAt = (frame: ReturnType<typeof panelsOf>['frame'], root: number) => {
		frame.attach(
			(() => {
				vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
					return this.classList.contains('base-flow-map') ? root : 5000
				})
				vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
				const rootElement = document.createElement('div')
				rootElement.className = 'base-flow-map'
				const area = document.createElement('div')
				rootElement.append(area)
				return area
			})(),
		)
		return frame.isCompact.value
	}

	afterEach(() => vi.restoreAllMocks())

	it.each([
		['edit', {}, 564],
		['edit', { details: true }, 564],
		['review', {}, 340],
		['view', { details: true }, 340],
		['view', { scenario: true }, 340],
		['view', {}, 0],
	] as const)('режим %s %o резервирует %i', (mode, flags, reserved) => {
		const { frame } = panelsOf(mode, flags)
		expect(compactAt(frame, reserved + 639)).toBe(true)
		expect(compactAt(frame, reserved + 640)).toBe(false)
	})

	it('резерв умножается на sizeScale/100', () => {
		const edit = panelsOf('edit', {}, 150).frame
		expect(compactAt(edit, 846 + 639)).toBe(true)
		expect(compactAt(edit, 846 + 640)).toBe(false)
		const view = panelsOf('view', {}, 200).frame
		expect(compactAt(view, 639)).toBe(true)
		expect(compactAt(view, 640)).toBe(false)
	})

	it('режим, сценарий и sizeScale пересчитывают резерв на лету', () => {
		const { frame, parts, props } = panelsOf('view')
		expect(compactAt(frame, 1000)).toBe(false)
		parts.chrome.hasScenario.value = true
		expect(frame.isCompact.value).toBe(false)
		parts.model.mode.value = 'edit'
		expect(frame.isCompact.value).toBe(true)
		props.sizeScale = 50
		expect(frame.isCompact.value).toBe(false)
		parts.model.mode.value = 'review'
		props.sizeScale = 150
		expect(frame.isCompact.value).toBe(true)
		props.sizeScale = 50
		expect(frame.isCompact.value).toBe(false)
	})

	it('панели прячутся в режиме правки и возвращаются в компактном виде', () => {
		const { panels, parts } = panelsOf('view')
		expect(panels.hasLegend.value && panels.hasMinimap.value && panels.hasToolbar.value).toBe(true)
		parts.state.isEditing.value = true
		expect([panels.hasLegend.value, panels.hasMinimap.value, panels.hasToolbar.value]).toEqual([false, false, false])
		parts.state.isCompact.value = true
		expect([panels.hasLegend.value, panels.hasMinimap.value, panels.hasToolbar.value]).toEqual([true, true, true])
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

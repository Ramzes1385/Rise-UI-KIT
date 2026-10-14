import { autoScrollStep, edgeSpeed, findScrollParent, frameScale } from '../../model/interaction/dashboardAutoScroll'

function scroller(overflow: string, size: { client: number; scroll: number }, axis: 'x' | 'y' = 'y'): HTMLElement {
	const element = document.createElement('div')
	element.style.overflowX = overflow
	element.style.overflowY = overflow
	const prop = axis === 'y' ? 'Height' : 'Width'
	Object.defineProperty(element, `client${prop}`, { value: size.client, configurable: true })
	Object.defineProperty(element, `scroll${prop}`, { value: size.scroll, configurable: true })
	return element
}

function trackScroll(element: HTMLElement): ReturnType<typeof vi.fn> {
	let left = 0
	let top = 0
	Object.defineProperty(element, 'scrollLeft', { get: () => left, configurable: true })
	Object.defineProperty(element, 'scrollTop', { get: () => top, configurable: true })
	const scrollTo = vi.fn((options: ScrollToOptions) => {
		left = options.left ?? left
		top = options.top ?? top
	})
	element.scrollTo = scrollTo as unknown as typeof element.scrollTo
	return scrollTo
}

function rectOf(top: number, bottom: number): DOMRect {
	return { left: 0, right: 400, top, bottom } as DOMRect
}

describe('dashboardAutoScroll', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		document.body.innerHTML = ''
	})

	describe('edgeSpeed', () => {
		it('в середине скорость нулевая, у краёв растёт к пределу', () => {
			expect(edgeSpeed(300, 0, 600)).toBe(0)
			expect(edgeSpeed(28, 0, 600)).toBe(-12)
			expect(edgeSpeed(-100, 0, 600)).toBe(-24)
			expect(edgeSpeed(572, 0, 600)).toBe(12)
			expect(edgeSpeed(900, 0, 600)).toBe(24)
		})

		it('у пустой области скорость нулевая', () => {
			expect(edgeSpeed(5, 10, 10)).toBe(0)
		})
	})

	describe('frameScale', () => {
		it('кадр 60 Гц с дрожанием даёт 1, быстрый кадр меньше, медленный больше, предел 4', () => {
			expect(frameScale(16.7)).toBe(1)
			expect(frameScale(1000 / 144)).toBeCloseTo(0.4167, 3)
			expect(frameScale(1000 / 30)).toBeCloseTo(2, 3)
			expect(frameScale(5000)).toBe(4)
			expect(frameScale(-5)).toBe(0)
		})
	})

	describe('findScrollParent', () => {
		it('находит ближайшего предка с прокруткой по любой оси', () => {
			const outer = scroller('auto', { client: 100, scroll: 500 })
			const inner = scroller('hidden', { client: 100, scroll: 500 })
			const horizontal = scroller('scroll', { client: 100, scroll: 500 }, 'x')
			const leaf = document.createElement('div')
			horizontal.append(leaf)
			inner.append(horizontal)
			outer.append(inner)
			document.body.append(outer)

			expect(findScrollParent(leaf)).toBe(horizontal)
			expect(findScrollParent(horizontal)).toBe(outer)
		})

		it('не считает прокручиваемым контейнер без переполнения', () => {
			const box = scroller('auto', { client: 500, scroll: 500 })
			const leaf = document.createElement('div')
			box.append(leaf)
			document.body.append(box)

			expect(findScrollParent(leaf)).toBeNull()
			expect(findScrollParent(null)).toBeNull()
		})
	})

	describe('autoScrollStep', () => {
		beforeEach(() => {
			vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600)
			vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800)
		})

		it('в середине экрана ничего не прокручивает', () => {
			const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)

			expect(autoScrollStep(null, { x: 400, y: 300 })).toEqual({ dx: 0, dy: 0 })
			expect(scrollBy).not.toHaveBeenCalled()
		})

		it('у нижнего края окна прокручивает окно и возвращает сдвиг', () => {
			let y = 0
			vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y)
			const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(((options: ScrollToOptions) => {
				y += options.top ?? 0
			}) as typeof window.scrollBy)

			expect(autoScrollStep(null, { x: 400, y: 600 })).toEqual({ dx: 0, dy: 24 })
			expect(scrollBy).toHaveBeenCalledWith({ left: 0, top: 24, behavior: 'instant' })
			expect(autoScrollStep(null, { x: 400, y: 600 }, 0.5).dy).toBe(12)
			expect(autoScrollStep(null, { x: 400, y: 0 }, 2).dy).toBe(-48)
		})

		it('у края прокручиваемого предка двигает его, а предок короче окна', () => {
			const parent = scroller('auto', { client: 200, scroll: 900 })
			const leaf = document.createElement('div')
			parent.append(leaf)
			document.body.append(parent)
			vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(rectOf(100, 300))
			vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
			const scrollTo = trackScroll(parent)

			const delta = autoScrollStep(leaf, { x: 200, y: 295 })

			expect(delta.dy).toBe(22)
			expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 22, behavior: 'instant' })
		})

		it('предок не двигается, пока указатель далеко от его краёв', () => {
			const parent = scroller('auto', { client: 200, scroll: 900 })
			const leaf = document.createElement('div')
			parent.append(leaf)
			document.body.append(parent)
			vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(rectOf(0, 400))

			expect(autoScrollStep(leaf, { x: 200, y: 200 })).toEqual({ dx: 0, dy: 0 })
		})

		it('ограничивает область предка окном', () => {
			const parent = scroller('auto', { client: 200, scroll: 900 })
			const leaf = document.createElement('div')
			parent.append(leaf)
			document.body.append(parent)
			vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(rectOf(-400, 2000))
			vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
			trackScroll(parent)

			expect(autoScrollStep(leaf, { x: 200, y: 590 }).dy).toBeGreaterThan(0)
		})
	})
})

import type { Ref } from 'vue'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useSlidingIndicator } from '../useSlidingIndicator'
import type { UseSlidingIndicatorOptions, UseSlidingIndicatorReturn } from '../types/useSlidingIndicator.types'

type ResizeCallback = () => void

const observers: FakeResizeObserver[] = []

class FakeResizeObserver {
	observed = new Set<Element>()
	observe = vi.fn((el: Element) => this.observed.add(el))
	unobserve = vi.fn((el: Element) => this.observed.delete(el))
	disconnect = vi.fn(() => this.observed.clear())

	constructor(public callback: ResizeCallback) {
		observers.push(this)
	}
}

function box([left, top, width, height]: [number, number, number, number]): DOMRect {
	return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function createList(count = 3): HTMLElement {
	const list = document.createElement('div')
	list.getBoundingClientRect = () => box([10, 20, 300, 40])
	for (let index = 0; index < count; index++) {
		const item = document.createElement('button')
		item.setAttribute('data-indicator-item', '')
		item.className = 'item'
		item.getBoundingClientRect = () => box([10 + index * 100, 24, 80 + index, 32])
		list.append(item)
	}
	document.body.append(list)
	return list
}

interface Mounted {
	indicator: UseSlidingIndicatorReturn
	unmount: () => void
}

function mountIndicator(container: Ref<HTMLElement | null>, index: Ref<number | null>, options?: UseSlidingIndicatorOptions): Mounted {
	let indicator!: UseSlidingIndicatorReturn
	const TestComponent = defineComponent({
		setup() {
			indicator = options ? useSlidingIndicator(container, index, options) : useSlidingIndicator(container, index)
			return () => h('div')
		},
	})
	const { unmount } = render(TestComponent)
	return { indicator, unmount }
}

describe('useSlidingIndicator', () => {
	let frames: FrameRequestCallback[]

	beforeEach(() => {
		observers.length = 0
		frames = []
		vi.stubGlobal('ResizeObserver', FakeResizeObserver)
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		document.body.innerHTML = ''
	})

	function flushFrames(): void {
		while (frames.length) frames.shift()!(0)
	}

	it('замеряет активный пункт относительно контейнера и отдаёт CSS-переменные', () => {
		const list = createList()

		const { indicator } = mountIndicator(ref(list), ref(1))

		expect(indicator.rect.value).toEqual({ x: 100, y: 4, width: 81, height: 32 })
		expect(indicator.style.value).toEqual({
			'--indicator-x': '100px',
			'--indicator-y': '4px',
			'--indicator-w': '81px',
			'--indicator-h': '32px',
		})
		expect(indicator.isVisible.value).toBe(true)
	})

	it('учитывает прокрутку и рамку контейнера', () => {
		const list = createList()
		Object.defineProperties(list, {
			scrollLeft: { value: 50 },
			clientLeft: { value: 2 },
			scrollTop: { value: 5 },
			clientTop: { value: 1 },
		})

		const { indicator } = mountIndicator(ref(list), ref(2))

		expect(indicator.rect.value).toMatchObject({ x: 248, y: 8 })
	})

	it('первый замер — без перехода, со второго кадра переход включается', () => {
		const list = createList()

		const { indicator } = mountIndicator(ref(list), ref(0))
		expect(indicator.isInstant.value).toBe(true)

		frames.shift()!(0)
		expect(indicator.isInstant.value).toBe(true)
		flushFrames()

		expect(indicator.isInstant.value).toBe(false)
	})

	it('смена индекса — новый замер с переходом', async () => {
		const list = createList()
		const index = ref<number | null>(0)
		const { indicator } = mountIndicator(ref(list), index)
		flushFrames()

		index.value = 2
		await nextTick()

		expect(indicator.rect.value?.x).toBe(200)
		expect(indicator.isInstant.value).toBe(false)
		expect(frames).toHaveLength(0)
	})

	it.each([null, -1, 5])('индекс %s — индикатора нет', async value => {
		const list = createList()
		const index = ref<number | null>(0)
		const { indicator } = mountIndicator(ref(list), index)

		index.value = value
		await nextTick()

		expect(indicator.rect.value).toBeNull()
		expect(indicator.style.value).toEqual({})
		expect(indicator.isVisible.value).toBe(false)
	})

	it('после скрытия индикатор появляется снова без перехода', async () => {
		const list = createList()
		const index = ref<number | null>(0)
		const { indicator } = mountIndicator(ref(list), index)
		flushFrames()

		index.value = null
		await nextTick()
		index.value = 1
		await nextTick()

		expect(indicator.isInstant.value).toBe(true)
	})

	it('без контейнера — индикатора нет', () => {
		const { indicator } = mountIndicator(ref(null), ref(0))

		expect(indicator.isVisible.value).toBe(false)
	})

	it('свой селектор пунктов', () => {
		const list = createList()
		list.firstElementChild!.removeAttribute('data-indicator-item')

		const { indicator } = mountIndicator(ref(list), ref(0), { itemSelector: '.item' })

		expect(indicator.rect.value?.x).toBe(0)
	})

	it('следит за размерами контейнера и только текущего активного пункта', async () => {
		const list = createList()
		const index = ref<number | null>(0)
		mountIndicator(ref(list), index)
		const [observer] = observers
		const items = [...list.children]
		expect([...observer.observed]).toEqual([list, items[0]])

		index.value = 2
		await nextTick()
		expect(observer.observed).toEqual(new Set([list, items[2]]))
		expect(observer.unobserve).toHaveBeenCalledWith(items[0])

		index.value = null
		await nextTick()
		expect(observer.observed).toEqual(new Set([list]))
	})

	it('изменение размеров — новый замер; update() — тоже', () => {
		const list = createList()
		const { indicator } = mountIndicator(ref(list), ref(0))
		list.firstElementChild!.getBoundingClientRect = () => box([30, 24, 120, 32])

		observers[0].callback()
		expect(indicator.rect.value?.width).toBe(120)

		list.firstElementChild!.getBoundingClientRect = () => box([30, 24, 140, 32])
		indicator.update()
		expect(indicator.rect.value?.width).toBe(140)
	})

	it('смена контейнера — наблюдение переезжает на новый', async () => {
		const container = ref<HTMLElement | null>(createList())
		mountIndicator(container, ref(0))
		const next = createList()

		container.value = next
		await nextTick()

		expect(observers[0].observed).toEqual(new Set([next, next.firstElementChild]))
	})

	it('при размонтировании наблюдение снимается', () => {
		const { unmount } = mountIndicator(ref(createList()), ref(0))

		unmount()

		expect(observers[0].disconnect).toHaveBeenCalled()
	})

	it('без ResizeObserver замер работает, наблюдения нет', () => {
		vi.stubGlobal('ResizeObserver', undefined)

		const { indicator, unmount } = mountIndicator(ref(createList()), ref(1))

		expect(indicator.rect.value?.x).toBe(100)
		expect(() => unmount()).not.toThrow()
	})
})

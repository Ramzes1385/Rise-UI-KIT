/**
 * Unit-тесты для useVirtualList.
 * Проверяют диапазон видимых строк, замеры высот, закреплённую строку, прокрутку к строке и подписки на элемент.
 */

import { render } from '@testing-library/vue'
import { defineComponent, nextTick, ref } from 'vue'
import { useVirtualList } from '../useVirtualList'
import type { UseVirtualListOptions, UseVirtualListReturn } from '../useVirtualList.types'

/** Экземпляры подменённого ResizeObserver: колбэк и вызовы */
interface ObserverRecord {
	callback: (entries: { target: Element }[]) => void
	observe: ReturnType<typeof vi.fn>
	unobserve: ReturnType<typeof vi.fn>
	disconnect: ReturnType<typeof vi.fn>
}

let observers: ObserverRecord[] = []

class ResizeObserverMock {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
	constructor(callback: ObserverRecord['callback']) {
		observers.push({ callback, observe: this.observe, unobserve: this.unobserve, disconnect: this.disconnect })
	}
}

/** Область прокрутки с подменёнными размерами: jsdom не считает раскладку */
function makeViewport(clientHeight: number): HTMLElement {
	const element = document.createElement('div')
	Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true })
	return element
}

type Options = Partial<Omit<UseVirtualListOptions, 'scrollElement'>>

/** Хост: composable в компоненте, область передаётся после монтирования */
function setup(options: Options = {}, viewport: HTMLElement | null = makeViewport(100)) {
	const scrollElement = ref<HTMLElement | null>(null)
	let api: UseVirtualListReturn | null = null
	const Host = defineComponent({
		setup() {
			api = useVirtualList({ count: () => 100, estimateSize: () => 20, scrollElement, ...options })
			return () => null
		},
	})
	const result = render(Host)
	scrollElement.value = viewport
	return { ...result, scrollElement, api: api as unknown as UseVirtualListReturn }
}

function indices(api: UseVirtualListReturn): number[] {
	return api.items.value.map(item => item.index)
}

describe('useVirtualList', () => {
	beforeEach(() => {
		observers = []
		vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	})

	afterEach(() => vi.unstubAllGlobals())

	it('видимые строки с запасом, распорки и полная высота', async () => {
		const { api } = setup()
		await nextTick()
		// 100px области по 20px — строки 0–5 (шестая начинается ровно на краю) и 5 строк запаса снизу
		expect(api.range.value).toEqual({ start: 0, end: 11 })
		expect(api.totalSize.value).toBe(2000)
		expect(api.paddingStart.value).toBe(0)
		expect(api.paddingEnd.value).toBe(2000 - 220)
		expect(api.items.value[1]).toEqual({ index: 1, key: 1, start: 20, size: 20 })
	})

	it('прокрутка сдвигает диапазон; overscan задаёт запас', async () => {
		const { api, scrollElement } = setup({ overscan: () => 1 })
		await nextTick()
		const viewport = scrollElement.value as HTMLElement
		viewport.scrollTop = 500
		viewport.dispatchEvent(new Event('scroll'))
		expect(api.scrollTop.value).toBe(500)
		expect(api.range.value).toEqual({ start: 24, end: 32 })
		expect(api.paddingStart.value).toBe(480)
	})

	it('пустой список и список без области', async () => {
		const empty = setup({ count: () => 0 })
		await nextTick()
		expect(empty.api.range.value).toEqual({ start: 0, end: 0 })
		expect(empty.api.items.value).toEqual([])
		expect(empty.api.totalSize.value).toBe(0)
		empty.api.scrollToIndex(3)
		const detached = setup({}, null)
		await nextTick()
		detached.api.update()
		detached.api.scrollToIndex(3)
		expect(detached.api.scrollTop.value).toBe(0)
	})

	it('замеры по ключу меняют смещения; нулевые и повторные замеры не пересчитывают', async () => {
		const keys = ['a', 'b', 'c', 'd']
		const { api } = setup({ count: () => keys.length, getKey: index => keys[index] })
		await nextTick()
		api.measure(1, 50)
		api.measure(1, 50)
		api.measure(2, 0)
		expect(api.items.value.map(({ key, start, size }) => [key, start, size])).toEqual([
			['a', 0, 20],
			['b', 20, 50],
			['c', 70, 20],
			['d', 90, 20],
		])
		// Строку «b» перенесли в начало: её высота осталась за ключом, новый замер «a» пересчитывает смещения
		keys.unshift(keys.splice(1, 1)[0])
		api.measure(1, 30)
		expect(api.items.value.map(({ key, size }) => [key, size])).toEqual([
			['b', 50],
			['a', 30],
			['c', 20],
			['d', 20],
		])
		expect(api.totalSize.value).toBe(120)
	})

	it('measureElement замеряет сразу и при изменении размера; отключённые элементы перестают отслеживаться', async () => {
		const { api, unmount } = setup()
		await nextTick()
		api.measureElement(null, 0)
		const row = document.createElement('div')
		document.body.append(row)
		Object.defineProperty(row, 'offsetHeight', { value: 40, configurable: true })
		api.measureElement(row, 2)
		const other = document.createElement('div')
		Object.defineProperty(other, 'offsetHeight', { value: 0, configurable: true })
		api.measureElement(other, 3)
		const itemObserver = observers[observers.length - 1]
		expect(itemObserver.observe).toHaveBeenCalledTimes(2)
		expect(api.items.value[2].size).toBe(40)
		Object.defineProperty(row, 'offsetHeight', { value: 60, configurable: true })
		itemObserver.callback([{ target: row }, { target: other }])
		expect(api.items.value[2].size).toBe(60)
		expect(itemObserver.unobserve).toHaveBeenCalledWith(other)
		unmount()
		expect(itemObserver.disconnect).toHaveBeenCalled()
		row.remove()
	})

	it('закреплённая строка рендерится и вне диапазона', async () => {
		const pinned = ref<number | undefined>(50)
		const { api, scrollElement } = setup({ pinnedIndex: () => pinned.value, overscan: () => 0 })
		await nextTick()
		expect(indices(api)).toEqual([0, 1, 2, 3, 4, 5, 50])
		const viewport = scrollElement.value as HTMLElement
		viewport.scrollTop = 1500
		viewport.dispatchEvent(new Event('scroll'))
		pinned.value = 2
		expect(indices(api)[0]).toBe(2)
		expect(indices(api)).toHaveLength(7)
		pinned.value = 76
		expect(indices(api)).toEqual([75, 76, 77, 78, 79, 80])
		pinned.value = 500
		expect(indices(api)).toHaveLength(6)
		pinned.value = undefined
		expect(indices(api)).toHaveLength(6)
	})

	it('scrollToIndex: start, center, end и auto', async () => {
		const { api, scrollElement } = setup()
		await nextTick()
		const viewport = scrollElement.value as HTMLElement
		api.scrollToIndex(10, 'start')
		expect(viewport.scrollTop).toBe(200)
		api.scrollToIndex(10, 'end')
		expect(viewport.scrollTop).toBe(120)
		api.scrollToIndex(10, 'center')
		expect(viewport.scrollTop).toBe(160)
		// auto: строка 9 видна (160–260) — прокрутки нет; строка 2 выше — к её началу; строка 40 ниже — к её концу
		api.scrollToIndex(9)
		expect(viewport.scrollTop).toBe(160)
		api.scrollToIndex(2)
		expect(viewport.scrollTop).toBe(40)
		api.scrollToIndex(40)
		expect(viewport.scrollTop).toBe(720)
		expect(api.scrollTop.value).toBe(720)
		api.scrollToIndex(-5, 'start')
		expect(viewport.scrollTop).toBe(0)
		api.scrollToIndex(500, 'start')
		expect(viewport.scrollTop).toBe(1980)
	})

	it('смена и снятие области переносит подписки', async () => {
		const { scrollElement, api } = setup()
		await nextTick()
		const first = scrollElement.value as HTMLElement
		const second = makeViewport(200)
		scrollElement.value = second
		await nextTick()
		expect(observers[0].disconnect).toHaveBeenCalled()
		first.scrollTop = 300
		first.dispatchEvent(new Event('scroll'))
		expect(api.scrollTop.value).toBe(0)
		expect(api.range.value.end).toBe(16)
		scrollElement.value = null
		await nextTick()
		expect(observers[1].disconnect).toHaveBeenCalled()
	})
})

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { render } from '@testing-library/vue'
import BaseDescriptions from '../ui/BaseDescriptions.vue'
import type { DescriptionsItem } from '../types/BaseDescriptions.types'

const ITEMS: DescriptionsItem[] = [
	{ key: 'a', label: 'A', value: '1' },
	{ key: 'b', label: 'B', value: '2', span: 3 },
	{ key: 'c', label: 'C', value: '3', span: 2.7 },
]

class FakeResizeObserver {
	static instances: FakeResizeObserver[] = []
	readonly observe = vi.fn()
	readonly disconnect = vi.fn()
	readonly callback: () => void
	constructor(callback: () => void) {
		this.callback = callback
		FakeResizeObserver.instances.push(this)
	}
}

let width = 0
let gap = ''

function spans(container: Element): string[] {
	return Array.from(container.querySelectorAll<HTMLElement>('.base-descriptions__item')).map(item => item.style.gridColumn)
}

describe('BaseDescriptions integration: колонки по ширине', () => {
	beforeEach(() => {
		FakeResizeObserver.instances = []
		width = 0
		gap = ''
		vi.stubGlobal('ResizeObserver', FakeResizeObserver)
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width)
		const original = window.getComputedStyle
		vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
			const style = original(element)
			return { ...style, columnGap: gap } as CSSStyleDeclaration
		})
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('span ограничен числом колонок, что помещаются: ширина / (minItemWidth + gap), не больше columns', async () => {
		width = 1000
		gap = '24px'
		const { container } = render(BaseDescriptions, { props: { items: ITEMS, columns: 4, minItemWidth: 300 } })
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 3', 'span 2'])
		expect(
			(container.querySelectorAll('.base-descriptions__item')[1] as HTMLElement).style.getPropertyValue('--base-descriptions-span'),
		).toBe('3')

		width = 500
		FakeResizeObserver.instances[0].callback()
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 1', 'span 1'])

		width = 5000
		FakeResizeObserver.instances[0].callback()
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 3', 'span 2'])
	})

	it('смена columns и minItemWidth пересчитывает колонки без изменения размера', async () => {
		width = 1200
		const { container, rerender } = render(BaseDescriptions, { props: { items: ITEMS, columns: 3, minItemWidth: 200 } })
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 3', 'span 2'])
		await rerender({ columns: 2 })
		expect(spans(container)).toEqual(['', 'span 2', 'span 2'])
		await rerender({ minItemWidth: 700 })
		expect(spans(container)).toEqual(['', 'span 1', 'span 1'])
	})

	it('без gap и с нулевой шириной колонки — одна колонка на пиксель не делится на ноль', async () => {
		width = 3
		const { container } = render(BaseDescriptions, { props: { items: ITEMS, columns: 5, minItemWidth: 0 } })
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 3', 'span 2'])
	})

	it('список появился позже — наблюдение начинается; исчез и размонтирован — отключается', async () => {
		width = 1000
		const { rerender, unmount } = render(BaseDescriptions, { props: { items: [] } })
		await nextTick()
		expect(FakeResizeObserver.instances).toHaveLength(0)
		await rerender({ items: ITEMS })
		await nextTick()
		expect(FakeResizeObserver.instances).toHaveLength(1)
		expect(FakeResizeObserver.instances[0].observe).toHaveBeenCalledWith(document.querySelector('dl'))
		await rerender({ items: [] })
		await nextTick()
		expect(FakeResizeObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
		unmount()
		expect(FakeResizeObserver.instances[0].disconnect).toHaveBeenCalledTimes(2)
	})

	it('без ResizeObserver — колонки считаются один раз при показе', async () => {
		vi.stubGlobal('ResizeObserver', undefined)
		width = 1000
		const { container } = render(BaseDescriptions, { props: { items: ITEMS, minItemWidth: 300 } })
		await nextTick()
		expect(spans(container)).toEqual(['', 'span 3', 'span 2'])
	})
})

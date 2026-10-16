import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTabs from '../ui/BaseTabs.vue'
import { render } from '@testing-library/vue'
import type { TabItem } from '../types/BaseTabs.types'

const ITEMS: TabItem[] = Array.from({ length: 8 }, (_, index) => ({ id: `tab-${index}`, label: `Вкладка ${index}` }))

const TAB_WIDTH = 100

const scrollTo = vi.fn()

function mockLayout(scrollWidth: number, scrollLeft = 0) {
	vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200)
	vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(TAB_WIDTH)
	vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
		return [...(this.parentElement?.children ?? [])].filter(child => child.getAttribute('role') === 'tab').indexOf(this) * TAB_WIDTH
	})
}

function mockReducedMotion(matches: boolean) {
	vi.stubGlobal('matchMedia', () => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
}

beforeEach(() => {
	scrollTo.mockReset()
	Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo })
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	)
	mockReducedMotion(false)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollTo
})

describe('BaseTabs: выбранная вкладка в зоне видимости', () => {
	it('при монтировании выбранная вкладка за краем сразу ставится по центру ленты', async () => {
		mockLayout(800)
		render(BaseTabs, { props: { modelValue: 'tab-4', items: ITEMS } })
		await nextTick()

		expect(scrollTo).toHaveBeenCalledWith({ left: 350, behavior: 'auto' })
	})

	it('вкладка, которая уже видна, ленту не двигает', async () => {
		mockLayout(800)
		render(BaseTabs, { props: { modelValue: 'tab-1', items: ITEMS } })
		await nextTick()

		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('лента не шире контейнера или нет выбранной вкладки — прокрутки нет', async () => {
		mockLayout(200)
		render(BaseTabs, { props: { modelValue: 'tab-4', items: ITEMS } })
		mockLayout(800)
		render(BaseTabs, { props: { modelValue: 'нет-такой', items: ITEMS } })
		await nextTick()

		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('смена значения плавно прокручивает ленту к новой вкладке, при «уменьшить движение» — сразу', async () => {
		mockLayout(800)
		const { rerender } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await rerender({ modelValue: 'tab-6' })
		await nextTick()

		expect(scrollTo).toHaveBeenLastCalledWith({ left: 550, behavior: 'smooth' })

		mockReducedMotion(true)
		const reduced = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await reduced.rerender({ modelValue: 'tab-7' })
		await nextTick()

		expect(scrollTo).toHaveBeenLastCalledWith({ left: 650, behavior: 'auto' })
	})

	it('вкладка левее видимой части — лента не уходит левее нуля', async () => {
		mockLayout(800, 300)
		render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await nextTick()

		expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'auto' })
	})
})

describe('BaseTabs: затухание краёв при переполнении без кнопок прокрутки', () => {
	it('справа есть скрытые вкладки — затухает правый край, после прокрутки — оба', async () => {
		mockLayout(800)
		const { container } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await nextTick()
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-end')
		expect(container.querySelector('.base-tabs')).not.toHaveClass('base-tabs--fade-start')

		mockLayout(800, 100)
		container.querySelector('.base-tabs__list')!.dispatchEvent(new Event('scroll'))
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-start', 'base-tabs--fade-end')
	})

	it('с кнопками прокрутки (isScrollable) затухания нет', async () => {
		mockLayout(800)
		const { container } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS, isScrollable: true } })
		await nextTick()
		await nextTick()

		expect(container.querySelector('.base-tabs')).not.toHaveClass('base-tabs--fade-end')
	})

	it('вкладки не переполняют ленту — затухания нет; добавленные вкладки пересчитывают состояние', async () => {
		mockLayout(200)
		const { container, rerender } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS.slice(0, 2) } })
		await nextTick()

		expect(container.querySelector('.base-tabs')).not.toHaveClass('base-tabs--fade-end')

		mockLayout(800)
		await rerender({ items: ITEMS })
		await nextTick()
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-end')
	})
})

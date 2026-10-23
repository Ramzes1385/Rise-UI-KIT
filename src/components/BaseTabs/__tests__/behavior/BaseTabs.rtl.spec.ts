import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTabs from '../../ui/BaseTabs.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { TabItem } from '../../types/BaseTabs.types'

const ITEMS: TabItem[] = Array.from({ length: 8 }, (_, index) => ({ id: `tab-${index}`, label: `Вкладка ${index}` }))

const TAB_WIDTH = 100
const LIST_WIDTH = 200
const SCROLL_WIDTH = 800

const scrollTo = vi.fn()

function mockRtlLayout(scrollLeft = 0) {
	vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(SCROLL_WIDTH)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(LIST_WIDTH)
	vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(TAB_WIDTH)
	vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
		const index = [...(this.parentElement?.children ?? [])].filter(child => child.getAttribute('role') === 'tab').indexOf(this)
		return LIST_WIDTH - TAB_WIDTH - index * TAB_WIDTH
	})
}

beforeEach(() => {
	scrollTo.mockReset()
	document.body.setAttribute('dir', 'rtl')
	Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo })
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	)
	vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
})

afterEach(() => {
	document.body.removeAttribute('dir')
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollTo
})

describe('BaseTabs: RTL, прокрутка к выбранной вкладке', () => {
	it('вкладка за левым краем: смещение отрицательное, а не обрезается до нуля', async () => {
		mockRtlLayout()
		render(BaseTabs, { props: { modelValue: 'tab-4', items: ITEMS } })
		await nextTick()

		expect(scrollTo).toHaveBeenCalledWith({ left: -350, behavior: 'auto' })
	})

	it('последняя вкладка: смещение не уходит левее конца ленты', async () => {
		mockRtlLayout()
		render(BaseTabs, { props: { modelValue: 'tab-7', items: ITEMS } })
		await nextTick()

		expect(scrollTo).toHaveBeenCalledWith({ left: LIST_WIDTH - SCROLL_WIDTH, behavior: 'auto' })
	})

	it('вкладка уже в видимой части или правее — лента не двигается; левее конца видимой области — не уходит правее нуля', async () => {
		mockRtlLayout()
		render(BaseTabs, { props: { modelValue: 'tab-1', items: ITEMS } })
		await nextTick()

		expect(scrollTo).not.toHaveBeenCalled()

		mockRtlLayout(-600)
		render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await nextTick()

		expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'auto' })
	})
})

describe('BaseTabs: RTL, затухание краёв и кнопки прокрутки', () => {
	it('начало списка справа: в начале затухает только конец, после прокрутки влево — оба края', async () => {
		mockRtlLayout()
		const { container } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS } })
		await nextTick()
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-end')
		expect(container.querySelector('.base-tabs')).not.toHaveClass('base-tabs--fade-start')

		mockRtlLayout(-100)
		container.querySelector('.base-tabs__list')!.dispatchEvent(new Event('scroll'))
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-start', 'base-tabs--fade-end')
	})

	it('в конце списка (левый край) затухает только начало', async () => {
		mockRtlLayout(-600)
		const { container } = render(BaseTabs, { props: { modelValue: 'tab-7', items: ITEMS } })
		await nextTick()
		await nextTick()

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs--fade-start')
		expect(container.querySelector('.base-tabs')).not.toHaveClass('base-tabs--fade-end')
	})

	it('кнопки прокрутки остаются физическими: скрытые вкладки слева — кнопка слева, а не справа', async () => {
		mockRtlLayout()
		const { rerender } = render(BaseTabs, { props: { modelValue: 'tab-0', items: ITEMS, isScrollable: true } })
		await nextTick()
		await nextTick()

		expect(screen.getByRole('button', { name: 'Прокрутить вкладки влево' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeNull()

		mockRtlLayout(-600)
		screen.getByRole('tablist').dispatchEvent(new Event('scroll'))
		await rerender({ modelValue: 'tab-7' })
		await nextTick()

		expect(screen.getByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Прокрутить вкладки влево' })).toBeNull()
	})
})

describe('BaseTabs: RTL, стрелки', () => {
	it('ArrowLeft выбирает следующую вкладку, ArrowRight — предыдущую', async () => {
		const user = userEvent.setup()
		render(BaseTabs, { props: { modelValue: 'tab-1', items: ITEMS.slice(0, 3) } })
		screen.getByRole('tab', { name: 'Вкладка 1' }).focus()

		await user.keyboard('{ArrowLeft}')
		expect(screen.getByRole('tab', { name: 'Вкладка 2' })).toHaveFocus()

		await user.keyboard('{ArrowRight}{ArrowRight}')
		expect(screen.getByRole('tab', { name: 'Вкладка 0' })).toHaveFocus()
	})
})

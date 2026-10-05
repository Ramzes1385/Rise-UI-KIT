import '@testing-library/jest-dom/vitest'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'create', label: 'Создать', icon: 'plus', isPrimary: true },
	{ value: 'upload', label: 'Загрузка', icon: 'upload', isDisabled: true },
]

function fakeRect(left: number, width: number): DOMRect {
	return { left, top: 0, width, height: 40, right: left + width, bottom: 40, x: left, y: 0, toJSON: () => ({}) } as DOMRect
}

function mockRects() {
	return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
		const bar = this.closest('.base-bottom-nav__bar')
		const items = bar ? Array.from(bar.querySelectorAll('[data-indicator-item]')) : []
		const index = items.indexOf(this)
		const width = this.tagName === 'LI' ? 100 : 60
		return index < 0 ? fakeRect(0, 400) : fakeRect(index * 100 + 20, width)
	})
}

const bar = (container: Element) => container.querySelector<HTMLElement>('.base-bottom-nav__bar')!
const indicator = (container: Element) => container.querySelector<HTMLElement>('.base-bottom-nav__indicator')
const indicatorX = (container: Element) => bar(container).style.getPropertyValue('--indicator-x')

function renderNav(props: Record<string, unknown> = {}) {
	return render(BaseBottomNav, { props: { items: ITEMS, modelValue: 'home', ...props } })
}

describe('BaseBottomNav: скользящий индикатор', () => {
	beforeEach(() => {
		mockRects()
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('замер выбранного пункта — переменные --indicator-* на полосе, смена пункта — новые значения', async () => {
		const { container } = renderNav()

		await waitFor(() => expect(indicatorX(container)).toBe('20px'))
		expect(bar(container).style.getPropertyValue('--indicator-w')).toBe('60px')
		expect(bar(container).style.getPropertyValue('--indicator-h')).toBe('40px')
		expect(indicator(container)).toHaveAttribute('aria-hidden', 'true')

		await fireEvent.click(screen.getByRole('button', { name: 'Поиск' }))
		await waitFor(() => expect(indicatorX(container)).toBe('120px'))
	})

	it('floating: замер по ячейке пункта; смена варианта перемеряет', async () => {
		const { container, rerender } = renderNav({ variant: 'floating', modelValue: 'search' })

		await waitFor(() => expect(bar(container).style.getPropertyValue('--indicator-w')).toBe('100px'))
		await rerender({ items: ITEMS, variant: 'default', modelValue: 'search' })
		await waitFor(() => expect(bar(container).style.getPropertyValue('--indicator-w')).toBe('60px'))
	})

	it('первый показ — сразу на месте, затем переход включается', async () => {
		const { container } = renderNav()

		await waitFor(() => expect(indicator(container)).not.toBeNull())
		await waitFor(() => expect(indicator(container)).not.toHaveClass('base-bottom-nav__indicator--instant'))
	})

	it('пресет none — индикатор сразу на месте (класс --instant) и после смены пункта', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container } = renderNav()

		await waitFor(() => expect(indicator(container)).toHaveClass('base-bottom-nav__indicator--instant'))
		await fireEvent.click(screen.getByRole('button', { name: 'Поиск' }))
		await waitFor(() => expect(indicatorX(container)).toBe('120px'))
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		expect(indicator(container)).toHaveClass('base-bottom-nav__indicator--instant')
	})

	it('prefers-reduced-motion — индикатор с классом --instant', async () => {
		vi.stubGlobal('matchMedia', (query: string) => ({
			matches: query.includes('reduce'),
			media: query,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
		}))
		const { container } = renderNav()

		await waitFor(() => expect(indicator(container)).not.toBeNull())
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		expect(indicator(container)).toHaveClass('base-bottom-nav__indicator--instant')
	})

	it('notched: у выбранного главного действия индикатора нет — его круг и есть отметка', async () => {
		const { container } = renderNav({ variant: 'notched', modelValue: 'create' })

		await Promise.resolve()
		expect(indicator(container)).toBeNull()
	})

	it('выбранный выключенный пункт: в классических вариантах — подложка на самом пункте, в floating — индикатор', async () => {
		const classic = renderNav({ modelValue: 'upload' })
		await Promise.resolve()
		expect(indicator(classic.container)).toBeNull()
		classic.unmount()

		const floating = renderNav({ variant: 'floating', modelValue: 'upload' })
		await waitFor(() => expect(indicatorX(floating.container)).toBe('320px'))
	})
})

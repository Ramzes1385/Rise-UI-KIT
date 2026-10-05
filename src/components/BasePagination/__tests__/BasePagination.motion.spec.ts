import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { render } from '@testing-library/vue'
import BasePagination from '../ui/BasePagination.vue'

function box(left: number, width: number): DOMRect {
	return { left, top: 0, width, height: 32, right: left + width, bottom: 32, x: left, y: 0, toJSON: () => ({}) } as DOMRect
}

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const pages = (container: Element) => container.querySelector('.base-pagination__pages') as HTMLElement
const indicator = (container: Element) => container.querySelector('.base-pagination__indicator')

describe('BasePagination: индикатор текущей страницы', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
		stubReducedMotion(false)
		vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
			if (!this.hasAttribute('data-indicator-item')) return box(0, 400)
			const page = Number(this.textContent)
			return box(page * 40, page >= 10 ? 40 : 32)
		})
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('один индикатор на список: пункты — только номера страниц, без стрелок и многоточий', async () => {
		const { container } = render(BasePagination, { props: { modelValue: 10, total: 200 } })
		await nextTick()

		expect(container.querySelectorAll('.base-pagination__indicator')).toHaveLength(1)
		expect(indicator(container)).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelectorAll('[data-indicator-item]')).toHaveLength(
			container.querySelectorAll('.base-pagination__page').length,
		)
		expect(container.querySelector('.base-pagination__ellipsis')).not.toHaveAttribute('data-indicator-item')
		expect(container.querySelector('.base-pagination__arrow')).not.toHaveAttribute('data-indicator-item')
	})

	it('замер текущей страницы — переменные --indicator-* на списке; смена страницы — новые значения', async () => {
		const { container, rerender } = render(BasePagination, { props: { modelValue: 2, total: 200 } })
		await nextTick()

		expect(pages(container).style.getPropertyValue('--indicator-x')).toBe('80px')
		expect(pages(container).style.getPropertyValue('--indicator-w')).toBe('32px')
		expect(pages(container).style.getPropertyValue('--indicator-h')).toBe('32px')

		await rerender({ modelValue: 12 })

		expect(pages(container).style.getPropertyValue('--indicator-x')).toBe('480px')
		expect(pages(container).style.getPropertyValue('--indicator-w')).toBe('40px')
	})

	it('первый показ — сразу на месте, со следующих кадров переезд с переходом', async () => {
		const { container, rerender } = render(BasePagination, { props: { modelValue: 2, total: 200 } })
		await nextTick()

		expect(indicator(container)).toHaveClass('base-pagination__indicator--instant')
		vi.advanceTimersToNextFrame()
		vi.advanceTimersToNextFrame()
		await rerender({ modelValue: 3 })

		expect(indicator(container)).not.toHaveClass('base-pagination__indicator--instant')
	})

	it('смена набора страниц при том же индексе текущей — индикатор перемеряется', async () => {
		const { container, rerender } = render(BasePagination, { props: { modelValue: 1, total: 50 } })
		await nextTick()
		const spy = vi.mocked(Element.prototype.getBoundingClientRect)
		const calls = spy.mock.calls.length

		await rerender({ total: 30 })

		expect(spy.mock.calls.length).toBeGreaterThan(calls)
		expect(pages(container).style.getPropertyValue('--indicator-x')).toBe('40px')
	})

	it('страница вне диапазона — индикатора нет', async () => {
		const { container } = render(BasePagination, { props: { modelValue: 99, total: 50 } })
		await nextTick()

		expect(indicator(container)).toBeNull()
	})

	it('пресет data-rise-motion="none" — индикатор сразу на месте', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = render(BasePagination, { props: { modelValue: 2, total: 200 } })
		await nextTick()
		vi.advanceTimersToNextFrame()
		vi.advanceTimersToNextFrame()
		await rerender({ modelValue: 3 })

		expect(indicator(container)).toHaveClass('base-pagination__indicator--instant')
	})

	it('«уменьшить движение» — индикатор сразу на месте', async () => {
		stubReducedMotion(true)
		const { container, rerender } = render(BasePagination, { props: { modelValue: 2, total: 200 } })
		await nextTick()
		vi.advanceTimersToNextFrame()
		vi.advanceTimersToNextFrame()
		await rerender({ modelValue: 3 })

		expect(indicator(container)).toHaveClass('base-pagination__indicator--instant')
	})
})

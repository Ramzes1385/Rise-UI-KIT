import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseCountdown from '../ui/BaseCountdown.vue'

const NOW = new Date('2026-10-02T12:00:00Z').getTime()
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const root = (container: Element): HTMLElement => container.querySelector('.base-countdown') as HTMLElement
const digits = (container: Element): HTMLElement[] => [...container.querySelectorAll<HTMLElement>('.base-countdown__digit')]
const text = (element: Element | null): string => (element?.textContent ?? '').replace(/\s+/g, ' ').trim()

describe('BaseCountdown digitAnimation', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it('по умолчанию roll: класс режима, разряд и Transition на каждую цифру', () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 75 * SECOND, format: ['minutes', 'seconds'] } })
		expect(root(container)).toHaveClass('base-countdown--digits-roll', 'base-countdown--count-down')
		expect(digits(container).map(digit => digit.dataset.char)).toEqual(['0', '1', '1', '5'])
		expect([...container.querySelectorAll('transition-stub')].map(stub => stub.getAttribute('name'))).toEqual(
			Array(4).fill('base-countdown-roll'),
		)
		expect(container.querySelector('.base-countdown__display')).toHaveAttribute('aria-hidden', 'true')
	})

	it.each(['flip', 'fade', 'blur'] as const)('%s — свой класс и имя перехода', digitAnimation => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 5 * SECOND, format: ['seconds'], digitAnimation } })
		expect(root(container)).toHaveClass(`base-countdown--digits-${digitAnimation}`)
		expect(container.querySelector('transition-stub')).toHaveAttribute('name', `base-countdown-${digitAnimation}`)
	})

	it('меняется только изменившийся разряд', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 75 * SECOND, format: ['minutes', 'seconds'] } })
		const before = digits(container)
		await vi.advanceTimersByTimeAsync(SECOND)
		const after = digits(container)
		expect(after.map(digit => digit.dataset.char)).toEqual(['0', '1', '1', '4'])
		expect(after.slice(0, 3)).toEqual(before.slice(0, 3))
		expect(after[0]).toBe(before[0])
		expect(after[2]).toBe(before[2])
		expect(after[3]).not.toBe(before[3])
	})

	it('inline: разделители статичны, текст как у часов', async () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + 2 * HOUR + 3 * MINUTE + 4 * SECOND, format: ['hours', 'minutes', 'seconds'], layout: 'inline' },
		})
		const clock = container.querySelector('.base-countdown__clock')
		expect(text(clock)).toBe('02:03:04')
		expect([...container.querySelectorAll('.base-countdown__slot--static')].map(slot => slot.textContent)).toEqual([':', ':'])
		const separator = container.querySelector('.base-countdown__slot--static')
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(text(clock)).toBe('02:03:03')
		expect(container.querySelector('.base-countdown__slot--static')).toBe(separator)
	})

	it('inline с днями: пробел после дней статичен', () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 26 * HOUR, layout: 'inline', format: ['days', 'hours'] } })
		const statics = [...container.querySelectorAll('.base-countdown__slot--static')].map(slot => slot.textContent)
		expect(statics[statics.length - 1]).toBe(' ')
		expect(text(container.querySelector('.base-countdown__clock'))).toMatch(/^1 .+ 02$/)
	})

	it('roll по направлению отсчёта: цель отодвинули — вверх, дальше снова вниз', async () => {
		const { container, rerender } = render(BaseCountdown, { props: { to: NOW + 5 * SECOND, format: ['seconds'] } })
		await rerender({ to: NOW + 9 * SECOND })
		expect(root(container)).toHaveClass('base-countdown--count-up')
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(root(container)).toHaveClass('base-countdown--count-down')
	})

	it('none — текст без разрядов и переходов', () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + 75 * SECOND, format: ['minutes', 'seconds'], digitAnimation: 'none' },
		})
		expect(root(container)).toHaveClass('base-countdown--digits-none')
		expect(container.querySelector('.base-countdown__slot')).toBeNull()
		expect(container.querySelector('transition-stub')).toBeNull()
		expect([...container.querySelectorAll('.base-countdown__value')].map(text)).toEqual(['01', '15'])
	})

	it('«уменьшить движение» — без Transition, цифры меняются сразу', async () => {
		stubReducedMotion(true)
		const { container } = render(BaseCountdown, { props: { to: NOW + 5 * SECOND, format: ['seconds'], digitAnimation: 'flip' } })
		await vi.advanceTimersByTimeAsync(0)
		expect(root(container)).toHaveClass('base-countdown--digits-none')
		expect(container.querySelector('transition-stub')).toBeNull()
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(text(container.querySelector('.base-countdown__value'))).toBe('04')
	})

	it('берёт digitAnimation из createUiKitPlugin({ defaults })', () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + HOUR },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCountdown: { digitAnimation: 'fade' } } })] },
		})
		expect(root(container)).toHaveClass('base-countdown--digits-fade')
	})
})

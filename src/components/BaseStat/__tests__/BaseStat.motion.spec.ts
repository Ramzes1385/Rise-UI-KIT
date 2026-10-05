import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseStat from '../ui/BaseStat.vue'
import { render } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const TRANSITIONS = { global: { stubs: { Transition: false } } }

const text = (element: Element | null | undefined): string => (element?.textContent ?? '').replace(/\s+/g, ' ').trim()

async function advance(ms: number): Promise<void> {
	vi.advanceTimersByTime(ms)
	await nextTick()
}

describe('BaseStat: движение значения', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('при монтировании число сразу конечное', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1284 } })

		expect(text(container.querySelector('.base-stat__value'))).toBe('1 284')
		expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
	})

	it('новое число идёт плавно целыми шагами; скринридер видит только итоговое', async () => {
		const { container, rerender } = render(BaseStat, { props: { label: 'Заказы', value: 1000 } })
		await rerender({ value: 2000 })
		await advance(100)

		const visible = container.querySelector('.base-stat__content [aria-hidden="true"]')
		const middle = Number(text(visible).replace(/\s/g, ''))
		expect(middle).toBeGreaterThan(1000)
		expect(middle).toBeLessThan(2000)
		expect(Number.isInteger(middle)).toBe(true)
		expect(text(container.querySelector('.base-stat__sr'))).toBe('2 000')

		await advance(500)
		expect(text(container.querySelector('.base-stat__value'))).toBe('2 000')
		expect(container.querySelector('.base-stat__sr')).toBeNull()
	})

	it('дробные значения округляются до знаков итогового и форматируются тем же valueFormat', async () => {
		const format = { style: 'percent', maximumFractionDigits: 1 } as const
		const { container, rerender } = render(BaseStat, { props: { label: 'Возвраты', value: 0.021, valueFormat: format } })
		await rerender({ value: 0.045 })
		await advance(100)

		expect(text(container.querySelector('.base-stat__content [aria-hidden="true"]'))).toMatch(/^[2-4](,\d)? %$/)
		await advance(500)
		expect(text(container.querySelector('.base-stat__value'))).toBe('4,5 %')
	})

	it('«уменьшить движение» и пресет none — сразу конечное', async () => {
		stubReducedMotion(true)
		const reduced = render(BaseStat, { props: { label: 'Заказы', value: 10 } })
		await reduced.rerender({ value: 70 })
		expect(text(reduced.container.querySelector('.base-stat__value'))).toBe('70')
		reduced.unmount()

		stubReducedMotion(false)
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const preset = render(BaseStat, { props: { label: 'Заказы', value: 10 } })
		await preset.rerender({ value: 70 })
		expect(text(preset.container.querySelector('.base-stat__value'))).toBe('70')
	})

	it('строка вместо числа и обратно — сразу, без промежуточных', async () => {
		const { container, rerender } = render(BaseStat, { props: { label: 'Статус', value: 40 } })
		await rerender({ value: 'Норма' })
		expect(text(container.querySelector('.base-stat__value'))).toBe('Норма')

		await rerender({ value: 90 })
		await advance(16)
		expect(text(container.querySelector('.base-stat__value'))).toBe('90')
	})

	it('слот value получает итоговое значение, а не промежуточное', async () => {
		const { container, rerender } = render(BaseStat, {
			props: { label: 'Заказы', value: 1 },
			slots: { value: '<template #value="{ formatted }">[{{ formatted }}]</template>' },
		})
		await rerender({ value: 500 })
		await advance(100)

		expect(text(container.querySelector('.base-stat__value'))).toBe('[500]')
	})

	it('заглушка сменяется значением с перекрёстным затуханием, изменение проявляется', async () => {
		const { container, rerender } = render(BaseStat, {
			...TRANSITIONS,
			props: { label: 'Выручка', value: 120, change: 0.1, isLoading: true },
		})
		expect(container.querySelectorAll('.base-skeleton')).toHaveLength(2)

		await rerender({ isLoading: false })

		expect(container.querySelector('.base-stat__content')).toHaveClass('base-stat-swap-enter-active')
		expect(container.querySelector('.base-stat__value .base-skeleton')).toHaveClass('base-stat-swap-leave-active')
		expect(container.querySelector('.base-stat__change--positive')).toHaveClass('base-stat-appear-enter-active')
		expect(container.querySelectorAll('.base-stat__change')).toHaveLength(1)
	})
})

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseProgress from '../ui/BaseProgress.vue'
import { render, screen } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const label = () => screen.getByRole('progressbar').querySelector('.base-progress__status-text')?.textContent

describe('BaseProgress: движение значения', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('полоса и подпись получают значение переменной --progress-percent, ширину не задают', () => {
		const { container } = render(BaseProgress, { props: { value: 40, hasLabel: true } })

		expect(container.querySelector('.base-progress__fill')).toHaveAttribute('style', '--progress-percent: 40;')
		expect(container.querySelector('.base-progress__status')).toHaveAttribute('style', '--progress-percent: 40;')
	})

	it('при монтировании число сразу конечное', () => {
		render(BaseProgress, { props: { value: 40, hasLabel: true } })

		expect(label()).toBe('40%')
	})

	it('число процентов растёт плавно, aria-valuenow — сразу новое значение', async () => {
		const { rerender } = render(BaseProgress, { props: { value: 20, hasLabel: true } })
		await rerender({ value: 80 })

		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80')
		vi.advanceTimersByTime(100)
		await nextTick()
		const middle = Number.parseInt(label() ?? '', 10)
		expect(middle).toBeGreaterThan(20)
		expect(middle).toBeLessThan(80)

		vi.advanceTimersByTime(200)
		await nextTick()
		expect(label()).toBe('80%')
	})

	it('у кольца число тоже плавное', async () => {
		const { container, rerender } = render(BaseProgress, { props: { value: 0, hasLabel: true, shape: 'circle' } })
		await rerender({ value: 50 })
		vi.advanceTimersByTime(100)
		await nextTick()

		expect(container.querySelector('.base-progress__circle-label')?.textContent).not.toBe('50%')
		vi.advanceTimersByTime(200)
		await nextTick()
		expect(container.querySelector('.base-progress__circle-label')?.textContent).toBe('50%')
	})

	it('«уменьшить движение» и пресет none — число сразу конечное', async () => {
		stubReducedMotion(true)
		const reduced = render(BaseProgress, { props: { value: 10, hasLabel: true } })
		await reduced.rerender({ value: 70 })
		expect(label()).toBe('70%')
		reduced.unmount()

		stubReducedMotion(false)
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const preset = render(BaseProgress, { props: { value: 10, hasLabel: true } })
		await preset.rerender({ value: 70 })
		expect(label()).toBe('70%')
	})

	it('слот получает настоящее значение и процент, а не промежуточные', async () => {
		const { rerender } = render(BaseProgress, {
			props: { value: 10, hasLabel: true },
			slots: { default: '<template #default="{ value, percent }">{{ value }}/{{ percent }}</template>' },
		})
		await rerender({ value: 60 })

		expect(label()).toBe('60/60')
	})
})

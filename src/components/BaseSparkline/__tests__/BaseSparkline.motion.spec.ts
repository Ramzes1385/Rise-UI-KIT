import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseSparkline from '../ui/BaseSparkline.vue'
import { render, screen } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

async function advance(ms: number): Promise<void> {
	vi.advanceTimersByTime(ms)
	await nextTick()
}

const FROM = [0, 5, 10]
const TO = [0, 10, 10]
const lineOf = (container: Element) => container.querySelector('.base-sparkline__line')?.getAttribute('d')

describe('BaseSparkline: движение данных', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('при монтировании линия сразу на месте', () => {
		const { container } = render(BaseSparkline, { props: { values: FROM, label: 'Заказы' } })

		expect(lineOf(container)).toBe('M0.00 28.00 L50.00 16.00 L100.00 4.00')
	})

	it('новые данные: точки линии и точка последнего значения идут плавно, сводка — сразу новая', async () => {
		const { container, rerender } = render(BaseSparkline, { props: { values: FROM, label: 'Заказы' } })
		await rerender({ values: TO })

		expect(screen.getByRole('img')).toHaveAccessibleName('Заказы: от 0 до 10, последнее значение 10')
		await advance(100)
		const middle = lineOf(container)
		expect(middle).not.toBe('M0.00 28.00 L50.00 16.00 L100.00 4.00')
		expect(middle).not.toBe('M0.00 28.00 L50.00 4.00 L100.00 4.00')

		await advance(500)
		expect(lineOf(container)).toBe('M0.00 28.00 L50.00 4.00 L100.00 4.00')
		expect((container.querySelector('.base-sparkline__dot') as HTMLElement).style.top).toBe('4px')
	})

	it('столбики растут плавно от промежуточных значений', async () => {
		const { container, rerender } = render(BaseSparkline, { props: { values: [10, 10], label: 'Заказы', variant: 'bar' } })
		const heights = () => [...container.querySelectorAll<HTMLElement>('.base-sparkline__bar')].map(bar => bar.style.height)
		await rerender({ values: [10, 2] })
		await advance(100)

		const middle = Number.parseFloat(heights()[1])
		expect(middle).toBeLessThan(100)
		expect(middle).toBeGreaterThan(20)
		await advance(500)
		expect(heights()).toEqual(['100%', '20%'])
	})

	it('«уменьшить движение», пресет none и другая длина набора — сразу конечное', async () => {
		stubReducedMotion(true)
		const reduced = render(BaseSparkline, { props: { values: FROM, label: 'Заказы' } })
		await reduced.rerender({ values: TO })
		expect(lineOf(reduced.container)).toBe('M0.00 28.00 L50.00 4.00 L100.00 4.00')
		reduced.unmount()

		stubReducedMotion(false)
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const preset = render(BaseSparkline, { props: { values: FROM, label: 'Заказы' } })
		await preset.rerender({ values: TO })
		expect(lineOf(preset.container)).toBe('M0.00 28.00 L50.00 4.00 L100.00 4.00')
		preset.unmount()

		document.documentElement.removeAttribute('data-rise-motion')
		const resized = render(BaseSparkline, { props: { values: FROM, label: 'Заказы' } })
		await resized.rerender({ values: [10, 0, 10, 0] })
		expect(lineOf(resized.container)).toBe('M0.00 4.00 L33.33 28.00 L66.67 4.00 L100.00 28.00')
	})
})

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseChart from '../ui/BaseChart.vue'
import type { ChartSeries } from '../types/BaseChart.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const labels = ['Янв', 'Фев', 'Мар']
const series: ChartSeries[] = [
	{ name: 'Выручка', values: [100, 200, 150] },
	{ name: 'Расходы', values: [50, -40, 80] },
]
const props = { label: 'Финансы', labels, series }

const line = (container: Element, index = 0) => container.querySelectorAll('.base-chart__line')[index].getAttribute('d')
const shapes = (container: Element) => container.querySelector('.base-chart__shapes') as SVGGElement
const lastY = (path: string | null) => Number(path?.split(' ').at(-1))

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

describe('BaseChart движение', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	describe('появление', () => {
		it('grow: линия поднимается от базовой линии к значениям', async () => {
			const { container } = render(BaseChart, { props: { ...props, series: [series[0]] } })
			await nextTick()
			expect(line(container)).toBe('M0.00 100.00 L50.00 100.00 L100.00 100.00')
			expect(shapes(container)).toHaveClass('base-chart__shapes--grow')

			vi.advanceTimersByTime(250)
			await nextTick()
			const middle = lastY(line(container))
			expect(middle).toBeGreaterThan(25)
			expect(middle).toBeLessThan(100)

			vi.advanceTimersByTime(300)
			await nextTick()
			expect(line(container)).toBe('M0.00 100.00 L50.00 0.00 L100.00 50.00')
		})

		it('grow у столбиков — CSS: класс, порядок точки и отрицательный столбик, геометрия сразу конечная', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar' } })
			const bars = [...container.querySelectorAll('.base-chart__bar')]
			expect(shapes(container)).toHaveClass('base-chart__shapes--grow')
			expect(bars[1]).toHaveAttribute('style', '--base-chart-order: 1;')
			expect(bars.filter(bar => bar.classList.contains('base-chart__bar--negative'))).toHaveLength(1)
			expect(Number(bars[0].getAttribute('height'))).toBeGreaterThan(0)
		})

		it('draw и fade — только класс, значения сразу конечные; линия с pathLength', () => {
			const { container, unmount } = render(BaseChart, { props: { ...props, animation: 'draw' } })
			expect(shapes(container)).toHaveClass('base-chart__shapes--draw')
			expect(container.querySelector('.base-chart__line')).toHaveAttribute('pathLength', '1')
			expect(lastY(line(container))).toBeLessThan(100)
			unmount()
			const faded = render(BaseChart, { props: { ...props, variant: 'area', animation: 'fade' } })
			expect(shapes(faded.container)).toHaveClass('base-chart__shapes--fade')
		})

		it('none — без класса появления и сразу конечные значения', () => {
			const { container } = render(BaseChart, { props: { ...props, animation: 'none' } })
			expect(shapes(container).getAttribute('class')).toBe('base-chart__shapes')
			expect(lastY(line(container))).toBeLessThan(100)
		})

		it('пустой график не анимирует появление', async () => {
			const { container, rerender } = render(BaseChart, { props: { ...props, labels: [] } })
			expect(shapes(container)).toBeNull()
			await rerender({ labels })
			expect(lastY(line(container))).toBeLessThan(100)
		})

		it('«уменьшить движение» и пресет none — сразу конечные значения', async () => {
			stubReducedMotion(true)
			const reduced = render(BaseChart, { props })
			await nextTick()
			expect(lastY(line(reduced.container))).toBeLessThan(100)
			reduced.unmount()

			stubReducedMotion(false)
			document.documentElement.setAttribute('data-rise-motion', 'none')
			const preset = render(BaseChart, { props })
			await nextTick()
			expect(lastY(line(preset.container))).toBeLessThan(100)
		})
	})

	describe('новые данные', () => {
		it('tween: значения и шкала Y плавно переходят, подписи едут и прячутся вне шкалы', async () => {
			const { container, rerender } = render(BaseChart, { props: { ...props, animation: 'none' } })
			const before = line(container)
			await rerender({ series: [{ ...series[0], values: [1000, 500, 2000] }, series[1]] })

			vi.advanceTimersByTime(100)
			await nextTick()
			expect(line(container)).not.toBe(before)
			const ticks = [...container.querySelectorAll<HTMLElement>('.base-chart__y-tick')]
			expect(ticks.some(tick => tick.style.transform.startsWith('translateY('))).toBe(true)
			expect(container.querySelectorAll('.base-chart__y-tick--outside').length).toBeGreaterThan(0)
			expect(container.querySelectorAll('.base-chart__grid--outside').length).toBeGreaterThan(0)

			vi.advanceTimersByTime(500)
			await nextTick()
			expect(container.querySelectorAll('.base-chart__y-tick--outside')).toHaveLength(0)
			expect(ticks.every(tick => !tick.getAttribute('style'))).toBe(true)
		})

		it('updateAnimation none — сразу новые значения', async () => {
			const { container, rerender } = render(BaseChart, { props: { ...props, animation: 'none', updateAnimation: 'none' } })
			await rerender({ series: [{ ...series[0], values: [10, 20, 15] }, series[1]] })
			const after = line(container)
			vi.advanceTimersByTime(600)
			await nextTick()
			expect(line(container)).toBe(after)
		})

		it('смена числа точек — новая группа фигур без класса появления, значения сразу', async () => {
			const { container, rerender } = render(BaseChart, { props })
			vi.advanceTimersByTime(600)
			await nextTick()
			await rerender({ labels: ['a', 'b'], series: [{ name: 'Новый', values: [1, 2] }] })
			const groups = container.querySelectorAll('.base-chart__shapes')
			const current = groups[groups.length - 1]
			expect(current.getAttribute('class')).toBe('base-chart__shapes')
			expect(current.querySelector('.base-chart__line')).toHaveAttribute('d', 'M0.00 100.00 L100.00 0.00')
		})

		it('скрытие ряда стопки: столбик плавно сжимается и гаснет', async () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar', isStacked: true, animation: 'none' } })
			const height = () => Number(container.querySelector('.base-chart__bar')?.getAttribute('height'))
			const full = height()
			await fireEvent.click(screen.getByRole('button', { name: 'Выручка' }))
			vi.advanceTimersByTime(100)
			await nextTick()
			expect(container.querySelector('.base-chart__bar')).toHaveClass('base-chart__bar--hidden')
			expect(height()).toBeGreaterThan(0)
			expect(height()).toBeLessThan(full)
			vi.advanceTimersByTime(600)
			await nextTick()
			expect(height()).toBe(0)
		})
	})

	it('маркеры и подсказка двигаются через transform по ширине области', async () => {
		const original = globalThis.ResizeObserver
		let notify: (entries: { contentRect: { width: number } }[]) => void = () => undefined
		globalThis.ResizeObserver = class {
			constructor(callback: typeof notify) {
				notify = callback
			}
			observe() {}
			disconnect() {}
		} as unknown as typeof ResizeObserver
		try {
			const { container } = render(BaseChart, { props: { ...props, animation: 'none' } })
			notify([{ contentRect: { width: 400 } }])
			await fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' })
			const marker = container.querySelector<HTMLElement>('.base-chart__marker')
			expect(marker?.style.getPropertyValue('--base-chart-marker-x')).toBe('0px')
			expect(marker?.getAttribute('style')).toMatch(/--base-chart-marker-y: \d+(\.\d+)?px/)
			await fireEvent.keyDown(screen.getByRole('img'), { key: 'End' })
			const tooltip = container.querySelector<HTMLElement>('.base-chart__tooltip')
			expect(tooltip?.style.getPropertyValue('--base-chart-guide-x')).toBe('400px')
			expect(container.querySelectorAll<HTMLElement>('.base-chart__marker')[0].style.getPropertyValue('--base-chart-marker-x')).toBe(
				'400px',
			)
		} finally {
			globalThis.ResizeObserver = original
		}
	})
})

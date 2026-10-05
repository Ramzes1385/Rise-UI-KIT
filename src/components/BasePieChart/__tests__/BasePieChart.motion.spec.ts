import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BasePieChart from '../ui/BasePieChart.vue'
import { fireEvent, render } from '@testing-library/vue'

const SEGMENTS = [
	{ label: 'A', value: 2 },
	{ label: 'B', value: 1 },
	{ label: 'C', value: 1 },
]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function circles(container: Element): SVGCircleElement[] {
	return [...container.querySelectorAll<SVGCircleElement>('.base-pie-chart__segment')]
}

function dashes(container: Element): Array<[string | null, string | null, boolean]> {
	return circles(container).map(circle => [
		circle.getAttribute('stroke'),
		circle.getAttribute('stroke-dasharray'),
		circle.classList.contains('base-pie-chart__segment--leaving'),
	])
}

function transitionEnd(propertyName: string): Event {
	return Object.assign(new Event('transitionend', { bubbles: true }), { propertyName })
}

describe('BasePieChart — анимации', () => {
	beforeEach(() => stubReducedMotion(false))
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	it('по умолчанию sweep: класс корня, части набегают по кругу — задержка и длительность из начала и доли', () => {
		const { container } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })
		const [first, second, third] = circles(container)

		expect(container.querySelector('figure')).toHaveClass('base-pie-chart--animation-sweep')
		expect(first).toHaveClass('base-pie-chart__segment--sweep')
		expect(first.style.getPropertyValue('--pie-start')).toBe('0')
		expect(first.style.getPropertyValue('--pie-share')).toBe('0.5')
		expect(second.style.getPropertyValue('--pie-start')).toBe('0.5')
		expect(third.style.getPropertyValue('--pie-start')).toBe('0.75')
		expect(third.style.getPropertyValue('--pie-share')).toBe('0.25')
		expect(third).toHaveAttribute('stroke-dasharray', '24.2 75.8')
	})

	it.each(['grow', 'fade', 'none'] as const)('%s: класс корня, части без набегания', animation => {
		const { container } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач', animation } })

		expect(container.querySelector('figure')).toHaveClass(`base-pie-chart--animation-${animation}`)
		expect(circles(container).every(circle => circle.classList.contains('base-pie-chart__segment--static'))).toBe(true)
	})

	it('новые данные: геометрия обновляется по label, новая часть растёт из нуля (added), ушедшая сжимается и удаляется по таймеру', async () => {
		vi.useFakeTimers()
		const { container, rerender } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач', animation: 'grow' } })
		const kept = circles(container)[1]

		await rerender({
			segments: [
				{ label: 'B', value: 1 },
				{ label: 'D', value: 1 },
			],
		})

		expect(dashes(container)).toEqual([
			['var(--rise-chart-1)', '0 100', true],
			['var(--rise-chart-1)', '49.2 50.8', false],
			['var(--rise-chart-3)', '0 100', true],
			['var(--rise-chart-2)', '49.2 50.8', false],
		])
		expect(circles(container)[1]).toBe(kept)
		expect(circles(container)[3]).toHaveClass('base-pie-chart__segment--added')
		expect(container.querySelectorAll('.base-pie-chart__item')).toHaveLength(2)
		await vi.runAllTimersAsync()
		expect(dashes(container).map(([, dash]) => dash)).toEqual(['49.2 50.8', '49.2 50.8'])
	})

	it('ушедшая часть удаляется по transitionend своей длины; чужие события и другие свойства не удаляют', async () => {
		const { container, rerender } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })
		await rerender({ segments: SEGMENTS.slice(0, 2) })
		const leaving = circles(container)[2]
		const kept = circles(container)[0]

		await fireEvent(leaving, transitionEnd('opacity'))
		await fireEvent(kept, transitionEnd('stroke-dasharray'))
		const child = document.createElementNS('http://www.w3.org/2000/svg', 'title')
		leaving.append(child)
		await fireEvent(child, transitionEnd('stroke-dasharray'))
		expect(circles(container)).toHaveLength(3)

		await fireEvent(leaving, transitionEnd('stroke-dasharray'))
		expect(circles(container)).toHaveLength(2)
	})

	it('страховочный таймер — полторы длительности обновления из CSS; вернувшаяся часть не удаляется', async () => {
		vi.useFakeTimers()
		vi.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue: () => '0.2s' } as unknown as CSSStyleDeclaration)
		const { container, rerender, unmount } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })

		await rerender({ segments: SEGMENTS.slice(0, 1) })
		await vi.advanceTimersByTimeAsync(299)
		expect(circles(container)).toHaveLength(3)
		await rerender({ segments: SEGMENTS.slice(0, 2) })
		await vi.advanceTimersByTimeAsync(1)
		expect(dashes(container).map(([, , isLeaving]) => isLeaving)).toEqual([false, false])
		await rerender({ segments: SEGMENTS.slice(0, 1) })
		unmount()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('при «уменьшить движение» и animation=none ушедшая часть удаляется сразу, новая — без роста', async () => {
		stubReducedMotion(true)
		const reduced = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })
		await reduced.rerender({ segments: [...SEGMENTS.slice(0, 2), { label: 'D', value: 1 }] })
		expect(circles(reduced.container)).toHaveLength(3)
		expect(circles(reduced.container)[2]).toHaveClass('base-pie-chart__segment--static')
		reduced.unmount()

		stubReducedMotion(false)
		const none = render(BasePieChart, {
			props: { segments: SEGMENTS, label: 'задач' },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePieChart: { animation: 'none' } } })] },
		})
		expect(none.container.querySelector('figure')).toHaveClass('base-pie-chart--animation-none')
		await none.rerender({ segments: SEGMENTS.slice(1) })
		expect(dashes(none.container).map(([, , isLeaving]) => isLeaving)).toEqual([false, false])
	})

	it('наведение на сжимающуюся часть не подсвечивает её и не ломает центр', async () => {
		const { container, rerender } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })
		await rerender({ segments: SEGMENTS.slice(0, 2) })

		await fireEvent.pointerEnter(circles(container)[2])
		expect(container.querySelector('.base-pie-chart__center')).toHaveTextContent('3задач')
		expect(container.querySelector('.base-pie-chart__segment--dimmed')).toBeNull()
		await fireEvent.pointerEnter(circles(container)[0])
		expect(circles(container)[1]).toHaveClass('base-pie-chart__segment--dimmed')
		expect(circles(container)[2]).toHaveClass('base-pie-chart__segment--dimmed')
	})
})

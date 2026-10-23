import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BasePieChart from '../ui/BasePieChart.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const SEGMENTS = [
	{ label: 'Готово', value: 30 },
	{ label: 'В работе', value: 15 },
	{ label: 'Отложено', value: 5, color: 'rgb(1, 2, 3)' },
]

describe('BasePieChart', () => {
	afterEach(() => setLocale('ru'))

	it('кольцо с итогом, легенда со значениями и процентами, цвета по порядку', () => {
		const { container } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })
		const segments = container.querySelectorAll('.base-pie-chart__segment')

		expect(screen.getByRole('figure', { name: 'задач' })).toBeInTheDocument()
		expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['Готово3060%', 'В работе1530%', 'Отложено510%'])
		expect(segments[0]).toHaveAttribute('stroke', 'var(--rise-chart-1)')
		expect(segments[2]).toHaveAttribute('stroke', 'rgb(1, 2, 3)')
		expect(segments[0]).toHaveAttribute('stroke-dasharray', '59.2 40.8')
		expect(segments[1]).toHaveAttribute('stroke-dashoffset', '-35')
		expect(container.querySelector('.base-pie-chart__center')).toHaveTextContent('50задач')
	})

	it('наведение на часть или пункт легенды подсвечивает её и показывает в центре', async () => {
		const { container } = render(BasePieChart, {
			props: { segments: SEGMENTS, label: 'задач', formatValue: (value: number) => `${value} шт.` },
		})
		const segments = container.querySelectorAll('.base-pie-chart__segment')

		await fireEvent.pointerEnter(segments[1])
		expect(container.querySelector('.base-pie-chart__center')).toHaveTextContent('15 шт.В работе')
		expect(segments[0]).toHaveClass('base-pie-chart__segment--dimmed')
		expect(screen.getAllByRole('listitem')[1]).toHaveClass('base-pie-chart__item--active')
		await fireEvent.pointerLeave(segments[1])
		await fireEvent.pointerEnter(screen.getAllByRole('listitem')[2])
		expect(container.querySelector('.base-pie-chart__center')).toHaveTextContent('5 шт.Отложено')
		await fireEvent.pointerLeave(screen.getAllByRole('listitem')[2])
		expect(container.querySelector('.base-pie-chart__center')).toHaveTextContent('50 шт.задач')
	})

	it('лишние части — в «Другое»; круг без центра; нули и одна часть', async () => {
		const many = Array.from({ length: 8 }, (_, index) => ({ label: `Часть ${index + 1}`, value: 8 - index }))
		const { container, rerender } = render(BasePieChart, {
			props: { segments: many, label: 'визитов', maxSegments: 4, variant: 'pie', size: 120 },
		})

		expect(screen.getAllByRole('listitem').map(item => item.querySelector('.base-pie-chart__name')?.textContent)).toEqual([
			'Часть 1',
			'Часть 2',
			'Часть 3',
			'Другое',
		])
		expect(container.querySelector('.base-pie-chart__center')).toBeNull()
		expect(container.querySelector('.base-pie-chart__segment')).toHaveAttribute('r', '10.5')
		expect((container.querySelector('.base-pie-chart__chart') as HTMLElement).style.width).toBe('120px')
		await rerender({ segments: [{ label: 'Одна', value: 4 }], variant: 'donut' })
		expect(container.querySelector('.base-pie-chart__segment:not(.base-pie-chart__segment--leaving)')).toHaveAttribute(
			'stroke-dasharray',
			'100 0',
		)
		await rerender({ segments: [{ label: 'Пусто', value: 0 }] })
		expect(screen.getByRole('listitem')).toHaveTextContent('Пусто00%')
		setLocale('en')
		await rerender({ segments: many, maxSegments: 2 })
		expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Other')
	})
})

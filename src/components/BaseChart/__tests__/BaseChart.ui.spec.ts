import '@testing-library/jest-dom/vitest'
import BaseChart from '../ui/BaseChart.vue'
import { createUiKitPlugin } from '@/plugin'
import { CHART_PARTS } from '../types/BaseChart.types'
import { fireEvent, render } from '@testing-library/vue'
import type { BaseChartPart, ChartSeries } from '../types/BaseChart.types'

const labels = ['Янв', 'Фев', 'Мар']
const series: ChartSeries[] = [
	{ name: 'Выручка', values: [100, 200, 150] },
	{ name: 'Расходы', values: [50, 80, 60] },
]
const base = { label: 'Финансы', labels, series, animation: 'none', updateAnimation: 'none' } as const
const ui = Object.fromEntries([...CHART_PARTS, 'root'].map(part => [part, `u-${part}`])) as Record<BaseChartPart | 'root', string>

async function showTooltip(container: Element): Promise<void> {
	const plot = container.querySelector('.base-chart__plot')!
	await fireEvent.focus(plot)
	await fireEvent.keyDown(plot, { key: 'ArrowRight' })
}

function partsIn(container: Element): BaseChartPart[] {
	return CHART_PARTS.filter(part => container.querySelector(`.base-chart__${part}`))
}

describe('BaseChart: проп ui', () => {
	it('без ui — только классы кита', async () => {
		const { container } = render(BaseChart, { props: { ...base, variant: 'area' } })
		await showTooltip(container)

		const exact = partsIn(container).filter(part => part !== 'x-tick')
		expect(exact).toEqual(
			expect.arrayContaining(['plot', 'grid', 'shapes', 'area', 'line', 'tooltip', 'marker', 'guide', 'legend-item']),
		)
		for (const part of exact) {
			for (const element of container.querySelectorAll(`.base-chart__${part}`)) {
				expect(element).toHaveAttribute('class', `base-chart__${part}`)
			}
		}
		expect(container.querySelectorAll('.base-chart__x-tick')[1]).toHaveAttribute('class', 'base-chart__x-tick')
		expect(container.querySelector('.base-chart')).toHaveAttribute('class', 'base-chart base-chart--area')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseChart, {
			props: { ...base, variant: 'area', animation: 'grow', hiddenSeries: ['Расходы'], customClass: { legend: 'own-legend' }, ui },
		})
		await showTooltip(container)

		expect(container.querySelector('.base-chart')).toHaveClass('u-root', 'base-chart--area')
		for (const part of partsIn(container)) {
			for (const element of container.querySelectorAll(`.base-chart__${part}`)) expect(element).toHaveClass(`u-${part}`)
		}
		expect(container.querySelector('.base-chart__legend')).toHaveClass('own-legend')
		expect(container.querySelector('.base-chart__shapes')).toHaveClass('base-chart__shapes--grow')
		expect(container.querySelector('.base-chart__line--hidden')).toHaveClass('u-line')
		expect(container.querySelector('.base-chart__legend-item--hidden')).toHaveClass('u-legend-item')
		expect(container.querySelector('.base-chart__x-tick--start')).toHaveClass('u-x-tick')
	})

	it('части столбиков и пустого состояния получают классы ui', () => {
		const bars = render(BaseChart, { props: { ...base, variant: 'bar', ui } })
		for (const bar of bars.container.querySelectorAll('.base-chart__bar')) expect(bar).toHaveClass('u-bar')

		const empty = render(BaseChart, { props: { ...base, series: [], ui } })
		expect(empty.container.querySelector('.base-chart__empty')).toHaveAttribute('class', 'base-chart__empty u-empty')
	})

	it('классы из defaults.BaseChart.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseChart, {
			props: { ...base, ui: { legend: 'own-legend' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseChart: { ui: { root: 'app-root', legend: 'app-legend' } } } })] },
		})

		expect(container.querySelector('.base-chart')).toHaveClass('base-chart', 'app-root')
		expect(container.querySelector('.base-chart__legend')).toHaveAttribute('class', 'base-chart__legend app-legend own-legend')
	})
})

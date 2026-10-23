import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BasePieChart from '../ui/BasePieChart.vue'
import { PIE_CHART_PARTS } from '../types/BasePieChart.types'

const SEGMENTS = [
	{ label: 'Готово', value: 30 },
	{ label: 'В работе', value: 15 },
]

describe('BasePieChart: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BasePieChart, { props: { segments: SEGMENTS, label: 'задач' } })

		for (const part of PIE_CHART_PARTS.filter(name => name !== 'segment' && name !== 'item')) {
			expect(container.querySelector(`.base-pie-chart__${part}`)).toHaveAttribute('class', `base-pie-chart__${part}`)
		}
		expect(container.querySelector('.base-pie-chart__segment')).toHaveAttribute(
			'class',
			'base-pie-chart__segment base-pie-chart__segment--sweep',
		)
		expect(container.querySelector('.base-pie-chart__item')).toHaveAttribute('class', 'base-pie-chart__item')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([...PIE_CHART_PARTS, 'root'].map(part => [part, `u-${part}`]))
		const { container } = render(BasePieChart, {
			props: { segments: SEGMENTS, label: 'задач', variant: 'donut', animation: 'grow', customClass: { legend: 'own-legend' }, ui },
		})

		expect(container.querySelector('.base-pie-chart')).toHaveClass('u-root', 'base-pie-chart--donut', 'base-pie-chart--animation-grow')
		for (const part of PIE_CHART_PARTS) {
			for (const element of container.querySelectorAll(`.base-pie-chart__${part}`)) expect(element).toHaveClass(`u-${part}`)
		}
		expect(container.querySelector('.base-pie-chart__legend')).toHaveClass('own-legend')
		expect(container.querySelector('.base-pie-chart__segment')).toHaveClass('base-pie-chart__segment--static')
	})

	it('классы из defaults.BasePieChart.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BasePieChart, {
			props: { segments: SEGMENTS, label: 'задач', ui: { value: 'own-value' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePieChart: { ui: { root: 'app-root', value: 'app-value' } } } })] },
		})

		expect(container.querySelector('.base-pie-chart')).toHaveClass('base-pie-chart', 'app-root')
		expect(container.querySelector('.base-pie-chart__value')).toHaveAttribute('class', 'base-pie-chart__value app-value own-value')
	})
})

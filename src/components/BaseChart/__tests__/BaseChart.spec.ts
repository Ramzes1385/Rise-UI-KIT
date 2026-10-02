import '@testing-library/jest-dom/vitest'
import BaseChart from '../ui/BaseChart.vue'
import { render, screen } from '@testing-library/vue'

const props = { label: 'Выручка', labels: ['Янв', 'Фев'], series: [{ name: 'Выручка', values: [1, 2] }] }

describe('BaseChart unit', () => {
	it('рендерит область графика с именем', () => {
		render(BaseChart, { props })
		expect(screen.getByRole('img', { name: /Выручка/ })).toBeInTheDocument()
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseChart, { props: { ...props, sizeScale: 125 } })
		expect((container.querySelector('.base-chart') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseChart, { props: { ...props, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-chart')).toHaveClass('my-root')
	})
})

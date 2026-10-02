import '@testing-library/jest-dom/vitest'
import BaseChart from '../ui/BaseChart.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseChart integration', () => {
	it('Tab и стрелки объявляют точку', async () => {
		const user = userEvent.setup()
		render(BaseChart, { props: { label: 'Выручка', labels: ['Янв', 'Фев'], series: [{ name: 'Выручка', values: [1, 2] }] } })
		await user.tab()
		expect(screen.getByRole('img', { name: /Выручка/ })).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		expect(screen.getByRole('status')).toHaveTextContent('Янв: Выручка: 1')
	})
})

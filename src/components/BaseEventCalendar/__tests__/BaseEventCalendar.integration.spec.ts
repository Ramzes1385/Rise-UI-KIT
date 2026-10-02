import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'

describe('BaseEventCalendar integration', () => {
	it('«Сегодня» — первая остановка Tab', async () => {
		const user = userEvent.setup()
		render(BaseEventCalendar, { props: { date: '2026-10-02' } })
		await user.tab()
		expect(screen.getByRole('button', { name: 'Сегодня' })).toHaveFocus()
	})
})

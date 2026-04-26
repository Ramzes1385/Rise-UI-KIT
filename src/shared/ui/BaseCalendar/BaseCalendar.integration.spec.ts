/**
 * Integration-тесты для BaseCalendar.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseCalendar from './BaseCalendar.vue'

describe('BaseCalendar integration', () => {
	it('должен эмитить update:modelValue при выборе даты', async () => {
		const user = userEvent.setup()
		const date = new Date(2024, 0, 1)
		const { emitted } = render(BaseCalendar, {
			props: { modelValue: date },
		})

		// Находим кнопку с числом 15
		const day15 = screen.getByText('15')
		await user.click(day15)

		expect(emitted()).toHaveProperty('update:modelValue')
		const event = emitted()['update:modelValue'][0] as Date[]
		expect(event[0].getDate()).toBe(15)
	})
})

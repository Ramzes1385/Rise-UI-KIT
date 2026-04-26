/**
 * Unit-тесты для BaseCalendar.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseCalendar from './BaseCalendar.vue'

describe('BaseCalendar unit', () => {
	it('должен рендерить календарь', () => {
		const { container } = render(BaseCalendar, {
			props: { modelValue: new Date(2024, 0, 1) },
		})
		expect(container.querySelector('.base-calendar')).toBeInTheDocument()
	})

	it('должен показывать правильный месяц и год', () => {
		render(BaseCalendar, {
			props: { modelValue: new Date(2024, 0, 1) },
		})
		expect(screen.getByText(/Январь/)).toBeInTheDocument()
		expect(screen.getByText(/2024/)).toBeInTheDocument()
	})
})

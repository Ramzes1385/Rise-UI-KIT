/**
 * Unit-тесты BaseTimePicker: список времени, подсказка, атрибуты поля.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseTimePicker from '../ui/BaseTimePicker.vue'

describe('BaseTimePicker', () => {
	it('поле — combobox с подсказкой «чч:мм» и цифровой клавиатурой; список с шагом в границах', async () => {
		const user = userEvent.setup()
		render(BaseTimePicker, { props: { label: 'Начало', step: 60, minTime: '09:00', maxTime: '12:00' } })

		const field = screen.getByRole('combobox', { name: 'Начало' })
		expect(field).toHaveAttribute('placeholder', 'чч:мм')
		expect(field).toHaveAttribute('inputmode', 'numeric')
		await user.click(field)

		expect([...document.querySelectorAll('[role="option"]')].map(option => option.textContent?.trim())).toEqual(['09:00', '10:00', '11:00', '12:00'])
	})

	it('своя подсказка и значение в поле', () => {
		render(BaseTimePicker, { props: { ariaLabel: 'Время', placeholder: 'Когда', modelValue: '08:15' } })

		expect(screen.getByRole('combobox', { name: 'Время' })).toHaveValue('08:15')
		expect(screen.getByRole('combobox', { name: 'Время' })).toHaveAttribute('placeholder', 'Когда')
	})
})

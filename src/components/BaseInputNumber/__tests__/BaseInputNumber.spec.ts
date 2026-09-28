/**
 * Unit-тесты BaseInputNumber: семантика spinbutton, формат числа, кнопки и границы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseInputNumber from '../ui/BaseInputNumber.vue'

describe('BaseInputNumber', () => {
	it('поле — spinbutton с именем, значением и границами; кнопки вне порядка Tab', () => {
		render(BaseInputNumber, { props: { modelValue: 3, min: 1, max: 9, label: 'Гостей' } })

		const field = screen.getByRole('spinbutton', { name: 'Гостей' })
		expect(field).toHaveValue('3')
		expect(field).toHaveAttribute('aria-valuenow', '3')
		expect(field).toHaveAttribute('aria-valuemin', '1')
		expect(field).toHaveAttribute('aria-valuemax', '9')
		expect(field).toHaveAttribute('inputmode', 'numeric')
		expect(screen.getByRole('button', { name: 'Уменьшить' })).toHaveAttribute('tabindex', '-1')
		expect(screen.getByRole('button', { name: 'Увеличить' })).toHaveAttribute('tabindex', '-1')
	})

	it('дробный шаг: запятая по-русски, знаки после запятой из precision, inputmode decimal', () => {
		render(BaseInputNumber, { props: { modelValue: 2.5, step: 0.5, precision: 2, ariaLabel: 'Вес' } })

		const field = screen.getByRole('spinbutton', { name: 'Вес' })
		expect(field).toHaveValue('2,50')
		expect(field).toHaveAttribute('inputmode', 'decimal')
	})

	it('пустое значение, formatValueText, свои атрибуты поля', () => {
		const { rerender } = render(BaseInputNumber, {
			props: {
				modelValue: null,
				ariaLabel: 'Сумма',
				formatValueText: (value: number) => `${value} ₽`,
				inputAttrs: { name: 'amount' },
			},
		})

		const field = screen.getByRole('spinbutton', { name: 'Сумма' })
		expect(field).toHaveValue('')
		expect(field).not.toHaveAttribute('aria-valuenow')
		expect(field).not.toHaveAttribute('aria-valuetext')
		expect(field).toHaveAttribute('name', 'amount')
		return rerender({ modelValue: 150 }).then(() => {
			expect(field).toHaveValue('150')
			expect(field).toHaveAttribute('aria-valuetext', '150 ₽')
		})
	})

	it('на границе кнопка отключена; без кнопок (hasControls=false) и только чтение — кнопок нет', async () => {
		const { rerender } = render(BaseInputNumber, { props: { modelValue: 1, min: 1, max: 2, ariaLabel: 'Число' } })

		expect(screen.getByRole('button', { name: 'Уменьшить' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeEnabled()
		await rerender({ modelValue: 2 })
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
		await rerender({ hasControls: false })
		expect(screen.queryByRole('button')).toBeNull()
		await rerender({ hasControls: true, isReadonly: true })
		expect(screen.queryByRole('button')).toBeNull()
	})
})

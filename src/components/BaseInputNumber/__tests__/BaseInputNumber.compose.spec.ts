import '@testing-library/jest-dom/vitest'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const decrease = () => screen.getByRole('button', { name: 'Уменьшить' })

const increase = () => screen.getByRole('button', { name: 'Увеличить' })

describe('BaseInputNumber: кнопки −/+ на BaseButton', () => {
	it('кнопки type=button вне порядка Tab, с прежним классом и customClass.button', () => {
		render(BaseInputNumber, { props: { modelValue: 3, ariaLabel: 'Гостей', customClass: { button: 'my-button' } } })

		for (const button of [decrease(), increase()]) {
			expect(button).toHaveAttribute('type', 'button')
			expect(button).toHaveAttribute('tabindex', '-1')
			expect(button).toHaveClass('base-input-number__button', 'my-button')
			expect(button).toBeEnabled()
		}
	})

	it('на границах min и max соответствующая кнопка disabled', async () => {
		const { rerender } = render(BaseInputNumber, { props: { modelValue: 1, min: 1, max: 3, ariaLabel: 'Гостей' } })

		expect(decrease()).toBeDisabled()
		expect(increase()).toBeEnabled()
		await rerender({ modelValue: 3 })
		expect(decrease()).toBeEnabled()
		expect(increase()).toBeDisabled()
	})

	it('клики меняют значение, а mousedown не уводит фокус из поля', async () => {
		const { emitted, rerender } = render(BaseInputNumber, { props: { modelValue: 5, step: 2, ariaLabel: 'Гостей' } })
		const field = screen.getByRole('spinbutton', { name: 'Гостей' })

		field.focus()
		for (const [button, value] of [
			[decrease(), 3],
			[increase(), 5],
		] as const) {
			const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			button.dispatchEvent(press)
			expect(press.defaultPrevented).toBe(true)
			await fireEvent.click(button)
			expect(field).toHaveFocus()
			expect(emitted('update:modelValue')?.at(-1)).toEqual([value])
			await rerender({ modelValue: value })
		}
		expect(emitted('update:modelValue')).toHaveLength(2)
	})

	it('при isDisabled обе кнопки disabled, при isReadonly кнопок нет', async () => {
		const { rerender, emitted } = render(BaseInputNumber, { props: { modelValue: 5, ariaLabel: 'Гостей', isDisabled: true } })

		expect(decrease()).toBeDisabled()
		expect(increase()).toBeDisabled()
		await fireEvent.click(increase())
		expect(emitted('update:modelValue')).toBeUndefined()
		await rerender({ isDisabled: false, isReadonly: true })
		expect(screen.queryByRole('button')).toBeNull()
	})
})

import '@testing-library/jest-dom/vitest'
import BaseInput from '../ui/BaseInput.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseInput: ввод через IME', () => {
	it('Safari: Escape с keyCode 229 отменяет композицию и не очищает поле поиска', () => {
		const { emitted } = render(BaseInput, { props: { modelValue: '日本語', type: 'search', ariaLabel: 'Поиск' } })
		const field = screen.getByRole('searchbox')

		const ime = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 229, bubbles: true, cancelable: true })
		field.dispatchEvent(ime)
		expect(ime.defaultPrevented).toBe(false)
		expect(emitted()['update:modelValue']).toBeUndefined()

		field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }))
		expect(emitted()['update:modelValue']).toEqual([['']])
	})
})

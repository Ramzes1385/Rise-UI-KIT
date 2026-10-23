import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BasePhoneInput from '../ui/BasePhoneInput.vue'
import { render, screen } from '@testing-library/vue'

describe('BasePhoneInput integration', () => {
	it('Tab: сначала код страны, затем номер; ввод по маске и вставка с кодом страны', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон' } })

		await user.tab()
		expect(screen.getByRole('combobox', { name: 'Код страны' })).toHaveFocus()
		await user.tab()
		const field = screen.getByLabelText('Телефон')
		expect(field).toHaveFocus()
		await user.keyboard('9161234567')
		expect(field).toHaveValue('(916) 123-45-67')
		expect(emitted('update:modelValue').at(-1)).toEqual(['+79161234567'])
		await user.clear(field)
		await user.paste('8 916 765-43-21')
		expect(emitted('update:modelValue').at(-1)).toEqual(['+79167654321'])
	})
})

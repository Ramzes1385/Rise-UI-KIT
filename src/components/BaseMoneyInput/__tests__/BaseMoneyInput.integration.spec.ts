import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseMoneyInput from '../ui/BaseMoneyInput.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseMoneyInput integration', () => {
	it('Tab в поле, ввод с разрядами, Tab из поля — копейки', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseMoneyInput, { props: { label: 'Сумма' } })

		await user.tab()
		const field = screen.getByLabelText('Сумма')
		expect(field).toHaveFocus()
		await user.keyboard('25000,5')
		expect((field as HTMLInputElement).value).toMatch(/^25\s000,5$/)
		expect(emitted('update:modelValue').at(-1)).toEqual([25000.5])
		await user.tab()
		expect((field as HTMLInputElement).value).toMatch(/^25\s000,50$/)
	})
})

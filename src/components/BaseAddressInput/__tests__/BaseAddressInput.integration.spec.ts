import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseAddressInput from '../ui/BaseAddressInput.vue'
import { render, screen, waitFor } from '@testing-library/vue'

describe('BaseAddressInput integration', () => {
	it('Tab в поле, ввод, стрелка и Enter выбирают подсказку', async () => {
		const user = userEvent.setup()
		const source = vi.fn(async (query: string) => [{ value: `г Москва, ${query}, д 1` }])
		const { emitted } = render(BaseAddressInput, { props: { label: 'Адрес', source, debounce: 0 } })

		await user.tab()
		const field = screen.getByRole('combobox', { name: 'Адрес' })
		expect(field).toHaveFocus()
		await user.keyboard('Арбат')
		await waitFor(() => expect(screen.getByRole('option', { name: 'г Москва, Арбат, д 1' })).toBeInTheDocument())
		await user.keyboard('{ArrowDown}{Enter}')
		expect(field).toHaveValue('г Москва, Арбат, д 1')
		expect(emitted('select')).toEqual([[{ value: 'г Москва, Арбат, д 1' }]])
	})
})

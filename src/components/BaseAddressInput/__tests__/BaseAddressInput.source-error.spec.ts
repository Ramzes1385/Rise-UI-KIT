import '@testing-library/jest-dom/vitest'
import { UI_TEXT } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import BaseAddressInput from '../ui/BaseAddressInput.vue'
import { render, screen, waitFor } from '@testing-library/vue'

describe('BaseAddressInput: ошибка источника подсказок', () => {
	it('при ошибке запроса вместо «Ничего не найдено» — текст ошибки; следующий удачный ответ его убирает', async () => {
		let isFailing = true
		const source = vi.fn(async (query: string) => {
			if (isFailing) throw new Error('network')
			return [{ value: `г Москва, ${query}` }]
		})
		const user = userEvent.setup()
		render(BaseAddressInput, { props: { label: 'Поле', source, debounce: 0 } })

		await user.type(screen.getByRole('combobox', { name: 'Поле' }), 'Арб')
		await waitFor(() => expect(screen.getAllByText(UI_TEXT.SEARCH_FAILED).length).toBeGreaterThan(0))
		expect(screen.getByRole('status')).toHaveTextContent(UI_TEXT.SEARCH_FAILED)
		expect(screen.queryByText(UI_TEXT.NO_RESULTS)).not.toBeInTheDocument()

		isFailing = false
		await user.type(screen.getByRole('combobox', { name: 'Поле' }), 'а')
		await waitFor(() => expect(screen.getByRole('option')).toBeInTheDocument())
		expect(screen.queryByText(UI_TEXT.SEARCH_FAILED)).not.toBeInTheDocument()
	})

	it('пустой успешный ответ по-прежнему даёт «Ничего не найдено»', async () => {
		const user = userEvent.setup()
		render(BaseAddressInput, { props: { label: 'Поле', source: vi.fn(async () => []), debounce: 0 } })

		await user.type(screen.getByRole('combobox', { name: 'Поле' }), 'Арб')

		await waitFor(() => expect(screen.getAllByText(UI_TEXT.NO_RESULTS).length).toBeGreaterThan(0))
		expect(screen.queryByText(UI_TEXT.SEARCH_FAILED)).not.toBeInTheDocument()
	})
})

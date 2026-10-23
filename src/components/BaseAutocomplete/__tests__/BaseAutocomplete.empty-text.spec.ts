import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'

describe('BaseAutocomplete: emptyText', () => {
	it('пустой список и live-область показывают переданный emptyText', async () => {
		const user = userEvent.setup()
		render(BaseAutocomplete, { props: { label: 'Поле', options: [], emptyText: 'Сбой источника' } })

		await user.click(screen.getByRole('combobox', { name: 'Поле' }))
		await user.keyboard('а')

		expect(screen.getAllByText('Сбой источника').length).toBeGreaterThan(0)
		expect(screen.getByRole('status')).toHaveTextContent('Сбой источника')
	})
})

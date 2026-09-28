import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

const OPTIONS: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'kzn', label: 'Казань' },
]

describe('BaseAutocomplete', () => {
	it('поле — combobox со списком: закрыт, без aria-controls; в поле — подпись выбранного', () => {
		render(BaseAutocomplete, { props: { options: OPTIONS, modelValue: 'kzn', label: 'Город', inputAttrs: { name: 'city' } } })

		const field = screen.getByRole('combobox', { name: 'Город' })
		expect(field).toHaveValue('Казань')
		expect(field).toHaveAttribute('aria-autocomplete', 'list')
		expect(field).toHaveAttribute('aria-expanded', 'false')
		expect(field).not.toHaveAttribute('aria-controls')
		expect(field).toHaveAttribute('autocomplete', 'off')
		expect(field).toHaveAttribute('name', 'city')
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('значение вне вариантов (свой вариант) показывается как текст, null — пустое поле', async () => {
		const { rerender } = render(BaseAutocomplete, { props: { options: OPTIONS, modelValue: 'Тверь', ariaLabel: 'Город' } })
		const field = screen.getByRole('combobox', { name: 'Город' })

		expect(field).toHaveValue('Тверь')
		await rerender({ modelValue: null })
		expect(field).toHaveValue('')
		await rerender({ modelValue: 'msk' })
		expect(field).toHaveValue('Москва')
	})
})

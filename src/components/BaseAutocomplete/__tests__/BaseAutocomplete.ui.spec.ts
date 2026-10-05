import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import { AUTOCOMPLETE_PARTS } from '../types/BaseAutocomplete.types'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

const OPTIONS: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва', description: 'Столица' },
	{ value: 'kzn', label: 'Казань' },
]

const ui = Object.fromEntries([['root', 'u-root'], ...AUTOCOMPLETE_PARTS.map(part => [part, `u-${part}`])])

const INNER: Record<string, string> = {
	panel: '.base-dropdown__panel',
	label: '.base-input__label',
	required: '.base-input__required',
	wrapper: '.base-input__wrapper',
	field: '.base-input__field',
	'error-text': '.base-input__error-text',
}

describe('BaseAutocomplete: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, части поля и панели — к элементам BaseInput и BaseDropdown', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseAutocomplete, {
			props: { options: OPTIONS, label: 'Город', isRequired: true, error: 'Ошибка', isLoading: true, ui },
		})

		await user.type(screen.getByRole('combobox', { name: /Город/ }), 'Мо')
		expect(container.querySelector('.base-autocomplete')).toHaveClass('u-root')
		for (const part of AUTOCOMPLETE_PARTS) {
			const element = document.querySelector(INNER[part] ?? `.base-autocomplete__${part}`)
			expect(element, part).toHaveClass(`u-${part}`)
		}
		expect(document.querySelector('.base-input__field')).toHaveClass('base-input__field', 'u-field')
		expect(document.querySelector('.base-input__field')!.className).not.toMatch(/base-autocomplete__field/)
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются, customClass панели сохраняется', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseAutocomplete, {
			props: { options: OPTIONS, ariaLabel: 'Город', customClass: { panel: 'legacy' }, ui: { option: 'own', panel: 'own-panel' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAutocomplete: { ui: { option: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-autocomplete')).toHaveAttribute('class', 'base-autocomplete')
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		await user.click(screen.getByRole('combobox', { name: 'Город' }))
		expect(document.querySelector('.base-autocomplete__option')).toHaveAttribute('class', 'base-autocomplete__option app own')
		expect(document.querySelector('.base-dropdown__panel')).toHaveClass('legacy', 'own-panel')
	})

	it('без ui и customClass у панели нет лишних классов', async () => {
		const user = userEvent.setup()
		render(BaseAutocomplete, { props: { options: OPTIONS, ariaLabel: 'Город' } })

		await user.click(screen.getByRole('combobox', { name: 'Город' }))
		expect(document.querySelector('.base-dropdown__panel')!.className).not.toMatch(/undefined|u-/)
	})
})

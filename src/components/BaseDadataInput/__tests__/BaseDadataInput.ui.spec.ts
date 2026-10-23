import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseDadataInput from '../ui/BaseDadataInput.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { DadataSuggestion } from '@utils/data/dadataUtils'
import { DADATA_INPUT_PARTS } from '../types/BaseDadataInput.types'

const SUGGESTIONS: DadataSuggestion[] = [{ value: 'г Москва, ул Тверская, д 7', unrestrictedValue: '125009, г Москва, ул Тверская, д 7' }]

const ui = Object.fromEntries([['root', 'u-root'], ...DADATA_INPUT_PARTS.map(part => [part, `u-${part}`])])

const INNER: Record<string, string> = {
	panel: '.base-dropdown__panel',
	label: '.base-input__label',
	required: '.base-input__required',
	wrapper: '.base-input__wrapper',
	field: '.base-input__field',
	'error-text': '.base-input__error-text',
}

async function renderTyped(items: DadataSuggestion[], props: Record<string, unknown> = {}) {
	const user = userEvent.setup()
	const view = render(BaseDadataInput, {
		props: { label: 'Адрес', source: async () => items, debounce: 0, isRequired: true, error: 'Ошибка', ui, ...props },
	})
	await user.type(screen.getByRole('combobox', { name: /Адрес/ }), 'тверская')
	return view
}

describe('BaseDadataInput: проп ui', () => {
	afterEach(() => document.body.replaceChildren())

	it('классы частей передаются частям внутреннего BaseAutocomplete', async () => {
		const { container } = await renderTyped(SUGGESTIONS)
		await waitFor(() => expect(document.querySelector('.base-autocomplete__option')).not.toBeNull())

		expect(container.querySelector('.base-dadata-input')).toHaveClass('u-root', 'base-autocomplete')
		for (const part of DADATA_INPUT_PARTS.filter(part => part !== 'empty')) {
			expect(document.querySelector(INNER[part] ?? `.base-autocomplete__${part}`), part).toHaveClass(`u-${part}`)
		}
		expect(document.querySelector('.base-input__field')!.className).not.toMatch(/base-dadata-input/)
	})

	it('пустой ответ — «Ничего не найдено» получает класс empty', async () => {
		await renderTyped([])

		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveClass('u-empty'))
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseDadataInput, {
			props: { label: 'Адрес', source: async () => [], ui: { field: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDadataInput: { ui: { field: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-dadata-input')).toHaveAttribute('class', 'base-autocomplete base-dadata-input')
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveAttribute('class', 'base-input__field app own')
	})
})

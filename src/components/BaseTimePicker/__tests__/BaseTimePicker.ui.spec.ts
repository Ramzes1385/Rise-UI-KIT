import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseTimePicker from '../ui/BaseTimePicker.vue'
import { render, screen } from '@testing-library/vue'
import { TIME_PICKER_PARTS } from '../types/BaseTimePicker.types'

const ui = Object.fromEntries([['root', 'u-root'], ...TIME_PICKER_PARTS.map(part => [part, `u-${part}`])])

const INNER: Record<string, string> = {
	panel: '.base-dropdown__panel',
	label: '.base-input__label',
	required: '.base-input__required',
	wrapper: '.base-input__wrapper',
	field: '.base-input__field',
	'error-text': '.base-input__error-text',
}

describe('BaseTimePicker: проп ui', () => {
	it('классы частей передаются частям внутреннего BaseAutocomplete', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseTimePicker, { props: { label: 'Время', isRequired: true, error: 'Ошибка', ui } })

		await user.type(screen.getByRole('combobox', { name: /Время/ }), '1')
		const root = container.querySelector('.base-time-picker')!
		expect(root).toHaveClass('base-autocomplete', 'u-root')
		for (const part of TIME_PICKER_PARTS.filter(part => part !== 'empty')) {
			expect(document.querySelector(INNER[part] ?? `.base-autocomplete__${part}`), part).toHaveClass(`u-${part}`)
		}
		await user.type(screen.getByRole('combobox', { name: /Время/ }), '9:7')
		expect(document.querySelector('.base-autocomplete__empty')).toHaveClass('u-empty')
		expect(document.querySelector('.base-input__field')!.className).not.toMatch(/base-time-picker__field/)
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseTimePicker, {
			props: { ariaLabel: 'Время', ui: { field: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTimePicker: { ui: { field: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-time-picker')).toHaveAttribute('class', 'base-autocomplete base-time-picker')
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveAttribute('class', 'base-input__field app own')
	})
})

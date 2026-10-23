import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BasePhoneInput from '../ui/BasePhoneInput.vue'
import { render, screen } from '@testing-library/vue'

const PARTS = ['country', 'trigger', 'flag', 'hidden', 'dial', 'chevron', 'list', 'option', 'option-name', 'option-dial', 'check'] as const

describe('BasePhoneInput: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('классы частей добавляются к БЭМ-классам кита, в том числе в открытом списке стран', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BasePhoneInput, {
			props: { label: 'Телефон', modelValue: '+79161234567', ui },
		})

		await userEvent.setup().click(screen.getByRole('combobox', { name: 'Код страны' }))
		expect(container.querySelector('.base-phone-input')).toHaveClass('u-root', 'base-input')
		for (const part of PARTS) expect(document.querySelector(`.base-phone-input__${part}`), part).toHaveClass(`u-${part}`)
		for (const flag of document.querySelectorAll('.base-phone-input__flag')) expect(flag).toHaveClass('u-flag')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BasePhoneInput, {
			props: { ui: { trigger: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePhoneInput: { ui: { trigger: 'app', dial: 'app-dial' } } } })] },
		})

		expect(container.querySelector('.base-phone-input__country')!.className).not.toMatch(/\b(app|own)\b/)
		expect(container.querySelector('.base-phone-input__dial')).toHaveClass('app-dial')
		expect(container.querySelector('.base-phone-input__trigger')).toHaveAttribute('class', 'base-phone-input__trigger app own')
	})
})

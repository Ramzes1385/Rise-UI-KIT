import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseMoneyInput from '../ui/BaseMoneyInput.vue'
import { MONEY_INPUT_PARTS } from '../types/BaseMoneyInput.types'

const ui = Object.fromEntries([['root', 'u-root'], ...MONEY_INPUT_PARTS.map(part => [part, `u-${part}`])])

describe('BaseMoneyInput: проп ui', () => {
	afterEach(() => setLocale('ru'))

	it('классы частей передаются частям внутреннего BaseInput', () => {
		const { container } = render(BaseMoneyInput, { props: { modelValue: 100, label: 'Сумма', isRequired: true, error: 'Ошибка', ui } })
		const root = container.querySelector('.base-money-input')!

		expect(root).toHaveClass('u-root', 'base-input')
		for (const part of MONEY_INPUT_PARTS.filter(part => part !== 'prefix')) {
			expect(root.querySelector(`.base-input__${part}`), part).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-input__postfix')).toHaveTextContent('₽')
	})

	it('знак валюты перед суммой получает класс prefix', () => {
		setLocale('en')
		const { container } = render(BaseMoneyInput, { props: { modelValue: 100, currency: 'USD', ui } })

		expect(container.querySelector('.base-input__prefix')).toHaveClass('u-prefix')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseMoneyInput, {
			props: { modelValue: 1, label: 'Сумма', ui: { field: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMoneyInput: { ui: { field: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-money-input')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveAttribute('class', 'base-input__field app own')
	})
})

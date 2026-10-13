import '@testing-library/jest-dom/vitest'
import BaseInput from '../ui/BaseInput.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

const PARTS = [
	'label',
	'required',
	'wrapper',
	'prefix',
	'field',
	'password-toggle',
	'postfix',
	'password-rules',
	'password-rule',
	'password-rule-icon',
	'password-rule-label',
	'error-text',
] as const

const PROPS = {
	label: 'Пароль',
	isRequired: true,
	type: 'password' as const,
	prefix: 'P',
	postfix: 'S',
	error: 'Ошибка',
	modelValue: 'a',
	passwordRules: [{ key: 'len', label: 'От 8 символов', validate: (value: string) => value.length >= 8 }],
}

describe('BaseInput: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseInput, { props: { ...PROPS, variant: 'soft', ui } })
		const root = container.querySelector('.base-input')!

		expect(root).toHaveClass('u-root', 'base-input--soft', 'base-input--error')
		for (const part of PARTS) expect(root.querySelector(`.base-input__${part}`), part).toHaveClass(`u-${part}`)
	})

	it('ui.clear добавляется к кнопке очистки поиска', () => {
		const { container } = render(BaseInput, { props: { modelValue: 'a', type: 'search', ui: { clear: 'u-clear' } } })

		expect(container.querySelector('.base-input__clear')).toHaveClass('u-clear')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseInput, {
			props: { modelValue: '', label: 'Имя', ui: { field: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseInput: { ui: { field: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-input__label')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveAttribute('class', 'base-input__field app own')
	})
})

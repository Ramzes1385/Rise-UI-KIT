import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { INPUT_NUMBER_PARTS } from '../types/BaseInputNumber.types'

const INNER = ['label', 'required', 'wrapper', 'field', 'error-text'] as const

const PROPS = { modelValue: 2, label: 'Гостей', isRequired: true, error: 'Ошибка' }

describe('BaseInputNumber: проп ui', () => {
	it('классы частей: кнопки — свои, остальные — частям BaseInput', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...INPUT_NUMBER_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseInputNumber, { props: { ...PROPS, ui } })
		const root = container.querySelector('.base-input-number')!

		expect(root).toHaveClass('u-root', 'base-input', 'base-input-number--controls')
		const buttons = root.querySelectorAll('.base-input-number__button')
		expect(buttons).toHaveLength(2)
		for (const button of buttons) expect(button).toHaveClass('u-button')
		for (const part of INNER) expect(root.querySelector(`.base-input__${part}`), part).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-input-number__field')).toBeNull()
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseInputNumber, {
			props: { modelValue: 1, label: 'Гостей', ui: { button: 'own', field: 'own-field' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseInputNumber: { ui: { button: 'app', wrapper: 'app-wrapper' } } } })] },
		})

		expect(container.querySelector('.base-input__label')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveClass('base-input__field', 'own-field')
		expect(container.querySelector('.base-input-number__button')).toHaveClass('base-input-number__button', 'app', 'own')
	})
})

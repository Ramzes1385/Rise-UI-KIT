import '@testing-library/jest-dom/vitest'
import BaseForm from '../ui/BaseForm.vue'
import { render } from '@testing-library/vue'
import { FORM_PARTS } from '../types/BaseForm.types'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'

describe('BaseForm: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...FORM_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseForm, {
			props: { variant: 'outline', isLoading: true, customClass: { root: 'own-root', content: 'own-content' }, ui },
		})
		const root = container.querySelector('.base-form')!

		expect(root).toHaveClass('u-root', 'base-form--outline', 'base-form--loading', 'own-root')
		for (const part of FORM_PARTS) expect(root.querySelector(`.base-form__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-form__overlay')).toHaveClass('base-form__overlay--visible')
		expect(root.querySelector('.base-form__content')).toHaveClass('own-content')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseForm, {
			props: { ui: { content: 'own' } },
			global: { provide: { [DEFAULTS_KEY]: { BaseForm: { ui: { content: 'app', root: 'app-root' } } } } },
		})
		const root = container.querySelector('.base-form')!

		expect(root).toHaveClass('base-form', 'app-root')
		expect(root.querySelector('.base-form__fieldset')).toHaveAttribute('class', 'base-form__fieldset')
		expect(root.querySelector('.base-form__content')).toHaveAttribute('class', 'base-form__content app own')
	})
})

import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import { CHECKBOX_GROUP_PARTS } from '../types/BaseCheckboxGroup.types'

const OPTIONS = [
	{ value: 'mon', label: 'Пн' },
	{ value: 'tue', label: 'Вт' },
]
const PROPS = { options: OPTIONS, modelValue: ['mon'], label: 'Дни', isRequired: true, hasSelectAll: true, error: 'Выберите день' }

describe('BaseCheckboxGroup: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...CHECKBOX_GROUP_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseCheckboxGroup, {
			props: { ...PROPS, variant: 'soft', customClass: { root: 'own-root', checkbox: 'own-checkbox' }, ui },
		})
		const root = container.querySelector('.base-checkbox-group')!

		expect(root).toHaveClass('u-root', 'base-checkbox-group--soft', 'base-checkbox-group--error', 'own-root')
		for (const part of CHECKBOX_GROUP_PARTS) expect(root.querySelector(`.base-checkbox-group__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelectorAll('.base-checkbox-group__checkbox.u-checkbox.base-checkbox.own-checkbox')).toHaveLength(2)
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseCheckboxGroup, {
			props: { ...PROPS, ui: { options: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCheckboxGroup: { ui: { root: 'app-root', options: 'app' } } } })] },
		})
		const root = container.querySelector('.base-checkbox-group')!

		expect(root).toHaveClass('base-checkbox-group', 'app-root')
		expect(root.querySelector('.base-checkbox-group__options')).toHaveAttribute('class', 'base-checkbox-group__options app own')
		expect(root.querySelector('.base-checkbox-group__checkbox')).not.toHaveClass('app')
	})
})

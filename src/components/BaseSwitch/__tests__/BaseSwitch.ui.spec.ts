import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSwitch from '../ui/BaseSwitch.vue'
import { render } from '@testing-library/vue'
import { SWITCH_PARTS } from '../types/BaseSwitch.types'

const PROPS = { modelValue: true, label: 'Уведомления', isRequired: true, error: 'Включите уведомления' }
const SLOTS = { default: 'Только важные' }

describe('BaseSwitch: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...SWITCH_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseSwitch, {
			props: { ...PROPS, variant: 'shadow', reverse: true, customClass: { root: 'own-root', handle: 'own-handle' }, ui },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-switch')!

		expect(root).toHaveClass('u-root', 'base-switch--shadow', 'base-switch--reverse', 'base-switch--error', 'own-root')
		for (const part of SWITCH_PARTS) expect(root.querySelector(`.base-switch__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-switch__handle')).toHaveClass('own-handle')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseSwitch, {
			props: { ...PROPS, ui: { handle: 'own' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSwitch: { ui: { root: 'app-root', handle: 'app' } } } })] },
		})
		const root = container.querySelector('.base-switch')!

		expect(root).toHaveClass('base-switch', 'app-root')
		expect(root.querySelector('.base-switch__slider')).toHaveAttribute('class', 'base-switch__slider')
		expect(root.querySelector('.base-switch__handle')).toHaveAttribute('class', 'base-switch__handle app own')
	})
})

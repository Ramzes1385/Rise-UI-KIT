import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'

const SLOTS = { default: '<button>День</button><button>Неделя</button>' }

describe('BaseButtonGroup: проп ui', () => {
	it('без ui — только классы кита', () => {
		render(BaseButtonGroup, { props: { ariaLabel: 'Период' }, slots: SLOTS })

		expect(screen.getByRole('group')).toHaveAttribute('class', 'base-button-group base-button-group--horizontal')
	})

	it('классы root добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseButtonGroup, {
			props: { orientation: 'vertical', customClass: 'own-root', ui: { root: 'u-root' } },
			slots: SLOTS,
		})

		expect(screen.getByRole('group')).toHaveClass('base-button-group', 'u-root', 'base-button-group--vertical', 'own-root')
	})

	it('классы из defaults.BaseButtonGroup.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseButtonGroup, {
			props: { ui: { root: 'own-root' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseButtonGroup: { ui: { root: 'app-root' } } } })] },
		})

		expect(screen.getByRole('group').className).toMatch(/^base-button-group app-root own-root /)
	})
})

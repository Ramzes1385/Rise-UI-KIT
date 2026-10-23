import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseBackTop from '../ui/BaseBackTop.vue'
import { render, screen } from '@testing-library/vue'

const VISIBLE = { visibilityHeight: -1, isExtended: true }

describe('BaseBackTop: проп ui', () => {
	it('без ui — только классы кита', async () => {
		render(BaseBackTop, { props: VISIBLE })

		const button = await screen.findByRole('button', { name: 'Наверх' })
		expect(button).toHaveClass('base-back-top', 'base-fab')
		expect(button.querySelector('.base-fab__icon')).toHaveClass('base-back-top__icon')
		expect(button.querySelector('.base-fab__label')).toHaveAttribute('class', 'base-fab__label base-back-top__label')
	})

	it('классы ui и customClass склеиваются по частям', async () => {
		render(BaseBackTop, {
			props: {
				...VISIBLE,
				ui: { root: 'u-root', icon: 'u-icon', label: 'u-label' },
				customClass: { root: 'own-root', icon: 'own-icon', label: 'own-label' },
			},
		})

		const button = await screen.findByRole('button', { name: 'Наверх' })
		expect(button).toHaveClass('base-back-top', 'u-root', 'own-root')
		expect(button.querySelector('.base-back-top__icon')).toHaveClass('u-icon', 'own-icon')
		expect(button.querySelector('.base-back-top__label')).toHaveClass('u-label', 'own-label')
	})

	it('классы из defaults.BaseBackTop.ui плагина склеиваются с классами экземпляра', async () => {
		render(BaseBackTop, {
			props: { ...VISIBLE, ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBackTop: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		const button = await screen.findByRole('button', { name: 'Наверх' })
		expect(button).toHaveClass('base-back-top', 'app-root', 'own-root')
		expect(button.querySelector('.base-back-top__label')).toHaveClass('app-label')
	})
})

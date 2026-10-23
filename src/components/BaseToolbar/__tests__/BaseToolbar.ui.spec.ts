import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseToolbar from '../ui/BaseToolbar.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseToolbar: проп ui', () => {
	it('без ui — только классы кита', () => {
		render(BaseToolbar, { props: { ariaLabel: 'Панель', variant: 'outline' } })

		expect(screen.getByRole('toolbar')).toHaveAttribute('class', 'base-toolbar base-toolbar--outline base-toolbar--horizontal')
	})

	it('класс root добавляется к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseToolbar, { props: { ariaLabel: 'Панель', orientation: 'vertical', ui: { root: 'u-root' }, customClass: 'own-root' } })

		const toolbar = screen.getByRole('toolbar')
		expect(toolbar).toHaveClass('base-toolbar', 'u-root', 'base-toolbar--vertical', 'own-root')
		expect(toolbar.className.indexOf('u-root')).toBeLessThan(toolbar.className.indexOf('own-root'))
	})

	it('классы из defaults.BaseToolbar.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseToolbar, {
			props: { ariaLabel: 'Панель', ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseToolbar: { ui: { root: 'app-root' } } } })] },
		})

		expect(screen.getByRole('toolbar').className).toMatch(/^base-toolbar app-root own-root /)
	})
})

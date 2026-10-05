import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseLayout from '../ui/BaseLayout.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { header: 'Шапка', sidebar: 'Меню', default: 'Заказы', footer: 'Подвал' }
const PARTS = ['skip-link', 'header', 'body', 'sidebar', 'content', 'main', 'footer'] as const

const part = (name: string) => document.querySelector(`.base-layout__${name}`)

describe('BaseLayout: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseLayout, { slots: SLOTS })

		expect(container.firstElementChild).toHaveAttribute('class', 'base-layout base-layout--sticky-header')
		for (const name of ['skip-link', 'body', 'content', 'sidebar', 'main'])
			expect(part(name)).toHaveAttribute('class', `base-layout__${name}`)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		const { container } = render(BaseLayout, {
			props: { isSidebarVisibleOnMobile: true, customClass: { root: 'own-root', sidebar: 'own-sidebar' }, ui },
			slots: SLOTS,
		})

		expect(container.firstElementChild).toHaveClass('base-layout', 'u-root', 'base-layout--mobile-sidebar', 'own-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-layout__${name}`, `u-${name}`)
		expect(part('sidebar')).toHaveClass('own-sidebar')
		expect(screen.getByRole('main')).toHaveClass('u-main')
	})

	it('классы из defaults.BaseLayout.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseLayout, {
			props: { ui: { main: 'own-main' } },
			slots: { default: 'Заказы' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseLayout: { ui: { main: 'app-main' } } } })] },
		})

		expect(screen.getByRole('main')).toHaveAttribute('class', 'base-layout__main app-main own-main')
	})
})

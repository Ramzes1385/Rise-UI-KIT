import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseHeader from '../ui/BaseHeader.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { default: 'Разделы', end: 'Профиль', bottom: 'Категории', menu: 'Меню' }
const PARTS = ['inner', 'start', 'title', 'center', 'end', 'toggle', 'bottom'] as const

const part = (name: string) => document.querySelector(`.base-header__${name}`)

describe('BaseHeader: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BaseHeader, { props: { title: 'Rise' }, slots: SLOTS })

		expect(screen.getByRole('banner')).toHaveClass('base-header', 'base-header--sticky')
		expect(part('start')).toHaveAttribute('class', 'base-header__start')
		expect(part('title')).toHaveAttribute('class', 'base-header__title')
		expect(part('center')).toHaveAttribute('class', 'base-header__center')
		expect(part('end')).toHaveAttribute('class', 'base-header__end')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		render(BaseHeader, {
			props: { title: 'Rise', variant: 'soft', isCompact: true, customClass: { root: 'own-root', title: 'own-title' }, ui },
			slots: SLOTS,
		})

		expect(screen.getByRole('banner')).toHaveClass('base-header', 'u-root', 'base-header--soft', 'base-header--compact', 'own-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-header__${name}`, `u-${name}`)
		expect(part('title')).toHaveClass('own-title')
	})

	it('название-ссылка получает классы части title', () => {
		render(BaseHeader, { props: { title: 'Rise', href: '/', ui: { title: 'u-title' } } })

		expect(screen.getByRole('link', { name: 'Rise' })).toHaveClass('base-header__title', 'u-title')
	})

	it('классы из defaults.BaseHeader.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseHeader, {
			props: { title: 'Rise', ui: { title: 'own-title' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseHeader: { ui: { root: 'app-root', title: 'app-title' } } } })] },
		})

		expect(screen.getByRole('banner')).toHaveClass('base-header', 'app-root')
		expect(part('title')).toHaveAttribute('class', 'base-header__title app-title own-title')
	})
})

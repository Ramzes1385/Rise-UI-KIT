import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSideBar from '../ui/BaseSideBar.vue'
import { render, screen } from '@testing-library/vue'
import type { SideBarItem } from '../types/BaseSideBar.types'

const ITEMS: SideBarItem[] = [{ key: 'home', label: 'Главная', icon: 'home', to: '/home' }]
const PROPS = { title: 'Панель', items: ITEMS, linkComponent: 'a' }
const SLOTS = { default: '<p>Тело</p>', footer: '<p>Подвал</p>' }
const PARTS = ['header', 'title', 'toggle', 'navigation', 'body', 'footer'] as const

const part = (name: string) => document.querySelector(`.base-side-bar__${name}`)
const uiOf = (names: readonly string[]) => Object.fromEntries(names.map(name => [name, `u-${name}`]))

describe('BaseSideBar: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BaseSideBar, { props: PROPS, slots: SLOTS })

		expect(screen.getByRole('complementary')).toHaveAttribute('class', 'base-side-bar')
		for (const name of ['header', 'title', 'navigation', 'body', 'footer']) {
			expect(part(name)).toHaveAttribute('class', `base-side-bar__${name}`)
		}
		expect(part('toggle')).toHaveClass('base-button')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = uiOf(['root', ...PARTS])
		render(BaseSideBar, { props: { ...PROPS, variant: 'soft', customClass: { root: 'own-root', body: 'own-body' }, ui }, slots: SLOTS })

		expect(screen.getByRole('complementary')).toHaveClass('base-side-bar', 'u-root', 'base-side-bar--soft', 'own-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-side-bar__${name}`, `u-${name}`)
		expect(part('body')).toHaveClass('own-body')
	})

	it('загрузка и свёрнутое содержимое тоже принимают классы ui', () => {
		const ui = uiOf(['loading', 'collapsed'])
		const { unmount } = render(BaseSideBar, { props: { ...PROPS, isLoading: true, ui } })
		expect(part('loading')).toHaveClass('base-side-bar__loading', 'u-loading')
		unmount()

		render(BaseSideBar, { props: { ...PROPS, isCollapsed: true, ui }, slots: { collapsedContent: '<span>И</span>' } })
		expect(part('collapsed')).toHaveClass('base-side-bar__collapsed', 'u-collapsed')
	})

	it('классы из defaults.BaseSideBar.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseSideBar, {
			props: { ...PROPS, ui: { header: 'own-header' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSideBar: { ui: { root: 'app-root', header: 'app-header' } } } })] },
		})

		expect(screen.getByRole('complementary')).toHaveClass('base-side-bar', 'app-root')
		expect(part('header')).toHaveAttribute('class', 'base-side-bar__header app-header own-header')
	})
})

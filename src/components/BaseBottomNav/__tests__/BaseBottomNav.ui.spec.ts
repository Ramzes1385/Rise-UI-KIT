import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import { render, waitFor } from '@testing-library/vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home', badge: 2 },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'chats', label: 'Чаты', icon: 'comment' },
]

const PARTS = ['bar', 'list', 'item', 'link', 'icon-wrap', 'icon', 'badge', 'label'] as const

const part = (container: Element, name: string) => container.querySelector<HTMLElement>(`.base-bottom-nav__${name}`)

describe('BaseBottomNav: проп ui', () => {
	it('без ui — только классы кита', async () => {
		const { container } = render(BaseBottomNav, { props: { items: ITEMS, modelValue: 'home' } })

		expect(container.querySelector('nav')).toHaveAttribute('class', 'base-bottom-nav base-bottom-nav--fixed')
		expect(part(container, 'bar')).toHaveAttribute('class', 'base-bottom-nav__bar')
		expect(part(container, 'list')).toHaveAttribute('class', 'base-bottom-nav__list')
		expect(part(container, 'label')).toHaveAttribute('class', 'base-bottom-nav__label')
		await waitFor(() => expect(part(container, 'indicator')).not.toBeNull())
		expect(part(container, 'indicator')?.classList[0]).toBe('base-bottom-nav__indicator')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const ui = Object.fromEntries([...PARTS, 'root', 'indicator'].map(name => [name, `u-${name}`]))
		const { container } = render(BaseBottomNav, {
			props: {
				items: ITEMS,
				modelValue: 'home',
				variant: 'soft',
				customClass: { root: 'own-root', bar: 'own-bar', label: 'own-label' },
				ui,
			},
		})

		expect(container.querySelector('nav')).toHaveClass('base-bottom-nav', 'u-root', 'base-bottom-nav--soft', 'own-root')
		expect(part(container, 'bar')).toHaveClass('u-bar', 'own-bar')
		expect(part(container, 'label')).toHaveClass('u-label', 'own-label')
		expect(part(container, 'link')).toHaveClass('u-link', 'base-bottom-nav__link--active')
		for (const name of PARTS) expect(part(container, name)).toHaveClass(`u-${name}`)
		await waitFor(() => expect(part(container, 'indicator')).toHaveClass('u-indicator'))
	})

	it('классы из defaults.BaseBottomNav.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseBottomNav, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBottomNav: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		expect(container.querySelector('nav')).toHaveClass('app-root')
		expect(part(container, 'label')).toHaveAttribute('class', 'base-bottom-nav__label app-label own-label')
	})
})

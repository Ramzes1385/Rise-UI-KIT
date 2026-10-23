import '@testing-library/jest-dom/vitest'
import BaseMenu from '../ui/BaseMenu.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import type { BaseMenuItem } from '../types/BaseMenu.types'

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon', hasDivider: true },
		{ label: 'Документация', href: 'https://example.com' },
	],
	[{ label: 'Удалить' }],
]

describe('BaseMenu: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseMenu, { props: { items: ITEMS } })
		const root = container.querySelector('.base-menu')!

		expect(root).toHaveAttribute('class', 'base-menu')
		expect(root.querySelector('.base-menu__group')).toHaveAttribute('class', 'base-menu__group')
		expect(root.querySelector('div.base-menu__item')).toHaveAttribute('class', 'base-menu__item')
		expect(root.querySelector('.base-menu__label')).toHaveAttribute('class', 'base-menu__label')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseMenu, {
			props: {
				items: ITEMS,
				variant: 'soft',
				customClass: { root: 'own-root', item: 'own-item' },
				ui: { root: 'u-root', group: 'u-group', item: 'u-item', icon: 'u-icon', label: 'u-label', divider: 'u-divider' },
			},
		})
		const root = container.querySelector('.base-menu')!

		expect(root).toHaveClass('base-menu', 'u-root', 'base-menu--soft', 'own-root')
		expect(root.querySelector('.base-menu__group')).toHaveClass('u-group')
		for (const item of root.querySelectorAll('.base-menu__item')) expect(item).toHaveClass('u-item', 'own-item')
		expect(root.querySelector('a.base-menu__item')).toHaveClass('base-link', 'u-item')
		expect(root.querySelector('.base-menu__icon')).toHaveClass('base-icon', 'u-icon')
		expect(root.querySelector('.base-menu__label')).toHaveClass('u-label')
		const dividers = root.querySelectorAll('.base-menu__divider')
		expect(dividers).toHaveLength(2)
		for (const divider of dividers) expect(divider).toHaveClass('base-separator', 'u-divider')
	})

	it('классы из defaults.BaseMenu.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseMenu, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMenu: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})
		const root = container.querySelector('.base-menu')!

		expect(root).toHaveClass('base-menu', 'app-root')
		expect(root.querySelector('.base-menu__label')).toHaveAttribute('class', 'base-menu__label app-label own-label')
	})
})

import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				title: 'Платформа',
				items: [
					{ label: 'Аналитика', icon: 'star', description: 'Отчёты', to: '/analytics' },
					{ label: 'Ещё', children: [{ label: 'Архив', to: '/archive' }] },
				],
			},
		],
		promo: { title: 'Rise 2.0' },
	},
	{ label: 'Цены', to: '/pricing' },
]

const UI = {
	root: 'u-root',
	bar: 'u-bar',
	list: 'u-list',
	item: 'u-item',
	trigger: 'u-trigger',
	end: 'u-end',
	panel: 'u-panel',
	content: 'u-content',
	group: 'u-group',
	'group-title': 'u-group-title',
	link: 'u-link',
	sub: 'u-sub',
	'link-icon': 'u-link-icon',
	'link-label': 'u-link-label',
	'link-desc': 'u-link-desc',
	promo: 'u-promo',
}

const part = (name: string): HTMLElement => document.querySelector(`.base-mega-menu__${name}`) as HTMLElement

async function openAll(): Promise<void> {
	await fireEvent.click(screen.getByRole('button', { name: 'Продукты' }))
	await fireEvent.click(screen.getByRole('button', { name: 'Ещё' }))
}

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

beforeEach(() => setViewport(1280))
afterEach(cleanup)

describe('BaseMegaMenu: проп ui', () => {
	it('без ui — только классы кита', async () => {
		render(BaseMegaMenu, { props: { items: ITEMS, trigger: 'click' }, slots: { end: 'Войти' } })
		await openAll()

		expect(screen.getByRole('navigation')).toHaveAttribute('class', 'base-mega-menu base-mega-menu--open')
		expect(part('bar')).toHaveAttribute('class', 'base-mega-menu__bar')
		expect(part('list')).toHaveAttribute('class', 'base-mega-menu__list')
		expect(part('item')).toHaveAttribute('class', 'base-mega-menu__item')
		expect(part('end')).toHaveAttribute('class', 'base-mega-menu__end')
		expect(part('panel')).toHaveAttribute('class', 'base-mega-menu__panel')
		expect(part('group-title')).toHaveAttribute('class', 'base-mega-menu__group-title')
		expect(part('link-desc')).toHaveAttribute('class', 'base-mega-menu__link-desc')
		expect(part('sub')).toHaveAttribute('class', 'base-mega-menu__links base-mega-menu__sub')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		render(BaseMegaMenu, {
			props: {
				items: ITEMS,
				trigger: 'click',
				variant: 'soft',
				customClass: { root: 'own-root', trigger: 'own-trigger', panel: 'own-panel', link: 'own-link' },
				ui: UI,
			},
			slots: { end: 'Войти' },
		})
		await openAll()

		expect(screen.getByRole('navigation')).toHaveClass('base-mega-menu', 'u-root', 'base-mega-menu--soft', 'own-root')
		for (const name of [
			'bar',
			'list',
			'item',
			'end',
			'content',
			'group',
			'group-title',
			'sub',
			'link-icon',
			'link-label',
			'link-desc',
			'promo',
		]) {
			expect(part(name)).toHaveClass(`base-mega-menu__${name}`, `u-${name}`)
		}
		const trigger = screen.getByRole('button', { name: 'Продукты' })
		expect(trigger).toHaveClass('base-mega-menu__trigger', 'u-trigger', 'base-mega-menu__trigger--open', 'own-trigger')
		expect(screen.getByRole('link', { name: 'Цены' })).toHaveClass('base-mega-menu__trigger', 'u-trigger', 'own-trigger')
		expect(part('panel')).toHaveClass('u-panel', 'own-panel')
		expect(screen.getByRole('button', { name: 'Ещё' })).toHaveClass(
			'base-mega-menu__link',
			'u-link',
			'base-mega-menu__link--parent',
			'own-link',
		)
		expect(screen.getByRole('link', { name: /Аналитика/ })).toHaveClass('base-mega-menu__link', 'u-link', 'own-link')
	})

	it('в мобильном виде ui достаётся кнопке «Меню» и панели под разделом', async () => {
		setViewport(500)
		render(BaseMegaMenu, { props: { items: ITEMS, ui: { toggle: 'u-toggle', panel: 'u-panel' } } })

		await fireEvent.click(screen.getByRole('button', { name: 'Меню' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Продукты' }))

		expect(screen.getByRole('button', { name: 'Меню' })).toHaveClass('base-mega-menu__toggle', 'u-toggle')
		expect(part('panel')).toHaveClass('base-mega-menu__panel', 'u-panel', 'base-mega-menu__panel--inline')
	})

	it('классы из defaults.BaseMegaMenu.ui плагина склеиваются с классами экземпляра', async () => {
		render(BaseMegaMenu, {
			props: { items: ITEMS, trigger: 'click', ui: { link: 'own-link' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMegaMenu: { ui: { root: 'app-root', link: 'app-link' } } } })] },
		})
		await fireEvent.click(screen.getByRole('button', { name: 'Продукты' }))

		expect(screen.getByRole('navigation')).toHaveClass('app-root')
		expect(screen.getByRole('link', { name: /Аналитика/ })).toHaveClass('base-mega-menu__link', 'app-link', 'own-link')
		expect(screen.getByRole('link', { name: /Аналитика/ }).className.indexOf('app-link')).toBeLessThan(
			screen.getByRole('link', { name: /Аналитика/ }).className.indexOf('own-link'),
		)
	})
})

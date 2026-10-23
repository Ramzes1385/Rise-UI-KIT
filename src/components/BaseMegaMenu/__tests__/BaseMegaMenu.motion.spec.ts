import '@testing-library/jest-dom/vitest'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/vue'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				items: [
					{ label: 'Аналитика', to: '/analytics' },
					{ label: 'Ещё', children: [{ label: 'Архив', to: '/archive' }] },
				],
			},
		],
	},
	{ key: 'resources', label: 'Ресурсы', groups: [{ items: [{ label: 'Блог', to: '/blog' }] }] },
]

const ENTER = /-enter-/

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

function renderMenu() {
	return render(BaseMegaMenu, { props: { items: ITEMS, trigger: 'click' }, global: { stubs: { transition: false } } })
}

const button = (name: string): HTMLElement => screen.getByRole('button', { name })
const list = (): HTMLElement => document.querySelector('.base-mega-menu__list') as HTMLElement
const contents = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.base-mega-menu__content')]
const sub = (): HTMLElement => document.querySelector('.base-mega-menu__sub') as HTMLElement
const inlinePanel = (): HTMLElement => document.querySelector('.base-mega-menu__panel--inline') as HTMLElement

const REDUCED = [
	['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
	[
		'пресет none',
		() => {
			stubReducedMotion(false)
			document.documentElement.setAttribute('data-rise-motion', 'none')
		},
	],
] as const

beforeEach(() => setViewport(1280))

afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
	document.documentElement.removeAttribute('data-rise-motion')
})

describe('BaseMegaMenu: движение', () => {
	it('смена раздела в открытой панели: новое содержимое проявляется, прежнее гаснет и удаляется', async () => {
		stubReducedMotion(false)
		renderMenu()
		await fireEvent.click(button('Продукты'))
		expect(contents()).toHaveLength(1)
		expect(contents()[0].className).not.toMatch(ENTER)

		await fireEvent.click(button('Ресурсы'))

		const [leaving, entering] = contents()
		expect(leaving).toHaveClass('base-mega-menu-swap-leave-active')
		expect(entering).toHaveClass('base-mega-menu-swap-enter-active')
		expect(entering).toHaveTextContent('Блог')
		await waitFor(() => expect(contents()).toHaveLength(1))
		await waitFor(() => expect(contents()[0].className).not.toMatch(ENTER))
	})

	it('вложенный уровень въезжает через Transition base-mega-menu-sub', async () => {
		stubReducedMotion(false)
		renderMenu()
		await fireEvent.click(button('Продукты'))
		await fireEvent.click(button('Ещё'))

		expect(sub()).toHaveClass('base-mega-menu-sub-enter-active')
		await waitFor(() => expect(sub().className).not.toMatch(ENTER))
	})

	it('мобильный список и панель под разделом раскрываются через Transition base-mega-menu-reveal', async () => {
		stubReducedMotion(false)
		setViewport(500)
		renderMenu()
		expect(list()).not.toBeVisible()

		await fireEvent.click(button('Меню'))
		expect(list()).toHaveClass('base-mega-menu-reveal-enter-active')
		await waitFor(() => expect(list().className).not.toMatch(ENTER))

		await fireEvent.click(button('Продукты'))
		expect(inlinePanel()).toHaveClass('base-mega-menu-reveal-enter-active')
		await waitFor(() => expect(inlinePanel().className).not.toMatch(ENTER))
	})

	it.each(REDUCED)('%s — сразу конечное состояние, без классов перехода', async (_, setup) => {
		setup()
		setViewport(500)
		const { unmount } = renderMenu()

		await fireEvent.click(button('Меню'))
		expect(list()).toBeVisible()
		expect(list().className).not.toMatch(ENTER)
		await fireEvent.click(button('Продукты'))
		expect(inlinePanel().className).not.toMatch(ENTER)
		await fireEvent.click(button('Ещё'))
		expect(sub().className).not.toMatch(ENTER)
		unmount()

		setViewport(1280)
		renderMenu()
		await fireEvent.click(button('Продукты'))
		await fireEvent.click(button('Ресурсы'))
		expect(contents()).toHaveLength(1)
		expect(contents()[0]).toHaveTextContent('Блог')
		expect(contents()[0].className).not.toMatch(ENTER)
	})
})

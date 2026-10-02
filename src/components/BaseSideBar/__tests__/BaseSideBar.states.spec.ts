import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseSideBar from '../ui/BaseSideBar.vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SideBarItem } from '../types/BaseSideBar.types'
import { preventLinkNavigation } from './BaseSideBar.test-utils'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const ITEMS: SideBarItem[] = [
	{ key: 'home', label: 'Главная', icon: 'home', to: '/home' },
	{
		key: 'work',
		type: 'group',
		label: 'Работа',
		children: [
			{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4, badgeColor: 'error' },
			{ key: 'tasks', label: 'Задачи', icon: 'check', to: '/tasks', badge: 2 },
		],
	},
	{
		key: 'catalog',
		label: 'Каталог',
		icon: 'folder',
		to: '/catalog',
		children: [
			{ key: 'products', label: 'Товары', to: '/catalog/products' },
			{
				key: 'sections',
				type: 'group',
				label: 'Разделы',
				children: [{ key: 'archive', label: 'Архив', to: '/catalog/archive' }],
			},
		],
	},
	{
		key: 'settings',
		label: 'Настройки',
		icon: 'settings',
		children: [
			{ key: 'profile', label: 'Профиль', to: '/settings/profile' },
			{ key: 'more', label: 'Ещё', children: [{ key: 'keys', label: 'Ключи', to: '/settings/keys' }] },
		],
	},
	{ key: 'locked', label: 'Закрыто', icon: 'x-circle', isDisabled: true, children: [{ label: 'Скрыто', to: '/hidden' }] },
]

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

afterEach(() => {
	cleanup()
	setViewport(1024)
})

preventLinkNavigation()

describe('BaseSideBar: разделы, бейджи, ориентир', () => {
	it('ставит ориентир nav с именем из title, navigationLabel или по умолчанию', async () => {
		const { rerender } = render(BaseSideBar, { props: { items: ITEMS, title: 'Панель' } })
		expect(screen.getByRole('navigation', { name: 'Панель' })).toBeInTheDocument()

		await rerender({ items: ITEMS, title: 'Панель', navigationLabel: 'Разделы сайта' })
		expect(screen.getByRole('navigation', { name: 'Разделы сайта' })).toBeInTheDocument()

		await rerender({ items: ITEMS, title: undefined, navigationLabel: undefined })
		expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeInTheDocument()
	})

	it('рисует раздел подписью и списком пунктов с её именем', () => {
		render(BaseSideBar, { props: { items: ITEMS } })

		const group = screen.getByRole('list', { name: 'Работа' })
		expect(within(group).getByRole('link', { name: /Входящие/ })).toHaveAttribute('href', '/inbox')
		expect(group).toHaveClass('base-side-bar-nav--group')
		expect(group).not.toHaveClass('base-side-bar-nav--nested')
	})

	it('красит бейдж по badgeColor, по умолчанию — neutral', () => {
		const { container } = render(BaseSideBar, { props: { items: ITEMS } })

		expect(container.querySelector('.base-side-bar-nav__badge--error')).toHaveTextContent('4')
		expect(container.querySelector('.base-side-bar-nav__badge--neutral')).toHaveTextContent('2')
	})

	it('в свёрнутой панели раздел — линия, бейдж — точка и часть имени пункта', () => {
		const { container } = render(BaseSideBar, { props: { items: ITEMS, isCollapsed: true } })

		expect(container.querySelector('.base-side-bar-nav__group-line')).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'Работа' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Входящие, 4' })).toBeInTheDocument()
		expect(container.querySelector('.base-side-bar-nav__dot--error')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Главная' })).toBeInTheDocument()
	})
})

describe('BaseSideBar: слоты в разделах', () => {
	it('передаёт слот item пунктам раздела', () => {
		render(BaseSideBar, {
			props: { items: ITEMS },
			slots: { item: '<template #item="{ item }"><span class="custom">[{{ item.label }}]</span></template>' },
		})

		expect(screen.getByText('[Входящие]')).toBeInTheDocument()
	})

	it('передаёт слоты icon, label и badge пунктам раздела', () => {
		render(BaseSideBar, {
			props: { items: ITEMS },
			slots: {
				icon: '<template #icon="{ item }">i:{{ item.key }}</template>',
				label: '<template #label="{ item }">l:{{ item.label }}</template>',
				badge: '<template #badge="{ item }">b:{{ item.badge }}</template>',
			},
		})

		expect(screen.getByText('i:inbox')).toBeInTheDocument()
		expect(screen.getByText('l:Задачи')).toBeInTheDocument()
		expect(screen.getByText('b:4')).toBeInTheDocument()
	})
})

describe('BaseSideBar: меню пункта в свёрнутой панели', () => {
	it('пункт с детьми и адресом открывает меню: сам пункт и его дети, разделы — подписью', async () => {
		render(BaseSideBar, { props: { items: ITEMS, isCollapsed: true } })

		const catalog = screen.getByRole('button', { name: 'Каталог' })
		await fireEvent.click(catalog)

		const menu = await screen.findByRole('menu', { name: 'Каталог' })
		expect(within(menu).getByRole('menuitem', { name: 'Каталог' })).toHaveAttribute('href', '/catalog')
		expect(within(menu).getByRole('menuitem', { name: 'Товары' })).toHaveAttribute('href', '/catalog/products')
		expect(within(menu).getByText('Разделы')).toBeInTheDocument()
		expect(within(menu).getByRole('menuitem', { name: 'Архив' })).toBeInTheDocument()
	})

	it('выбор пункта меню вызывает click пункта и itemClick', async () => {
		const click = vi.fn()
		const items: SideBarItem[] = [{ key: 'tools', label: 'Инструменты', icon: 'settings', children: [{ label: 'Экспорт', click }] }]
		const { emitted } = render(BaseSideBar, { props: { items, isCollapsed: true } })

		await fireEvent.click(screen.getByRole('button', { name: 'Инструменты' }))
		const menu = await screen.findByRole('menu', { name: 'Инструменты' })
		expect(within(menu).getByText('Инструменты')).toBeInTheDocument()
		await fireEvent.click(within(menu).getByRole('menuitem', { name: 'Экспорт' }))

		expect(click).toHaveBeenCalledWith(items[0].children![0], expect.any(Event))
		const clicks = emitted<[SideBarItem, Event]>().itemClick
		expect(clicks.at(-1)?.[0]).toEqual(items[0].children![0])
	})

	it('отключённый пункт с детьми меню не открывает', () => {
		render(BaseSideBar, { props: { items: ITEMS, isCollapsed: true } })

		expect(screen.getByRole('button', { name: 'Закрыто' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Закрыто' })).not.toHaveAttribute('aria-haspopup')
	})
})

describe('BaseSideBar: мобильный режим', () => {
	it('без mobileBreakpoint и на широком экране панель стоит в раскладке', () => {
		setViewport(500)
		render(BaseSideBar, { props: { items: ITEMS, title: 'Панель' } })

		expect(screen.getByRole('complementary')).not.toHaveClass('base-side-bar--mobile')
	})

	it('уже брейкпоинта панель выезжает по v-model:isMobileOpen и закрывается после перехода', async () => {
		setViewport(500)
		const { emitted, rerender } = render(BaseSideBar, {
			props: { items: ITEMS, title: 'Панель', mobileBreakpoint: 'md', isMobileOpen: false, isCollapsed: true },
		})
		await nextTick()
		expect(screen.queryByRole('complementary')).toBeNull()

		await rerender({ items: ITEMS, title: 'Панель', mobileBreakpoint: 'md', isMobileOpen: true, isCollapsed: true })
		const dialog = await screen.findByRole('dialog', { name: 'Панель' })
		const aside = within(dialog).getByRole('complementary')
		expect(aside).toHaveClass('base-side-bar--mobile')
		expect(aside).not.toHaveClass('base-side-bar--collapsed')
		expect(within(aside).queryByRole('heading')).toBeNull()

		await fireEvent.click(within(dialog).getByRole('button', { name: 'Настройки' }))
		expect(emitted()['update:isMobileOpen']).toBeUndefined()

		await fireEvent.click(within(dialog).getByRole('link', { name: 'Главная' }))
		expect(emitted()['update:isMobileOpen']).toEqual([[false]])
	})

	it('без title панель называется «Меню», кнопка закрытия шлёт update:isMobileOpen', async () => {
		setViewport(500)
		const { emitted } = render(BaseSideBar, { props: { items: ITEMS, mobileBreakpoint: 'md', isMobileOpen: true } })

		const dialog = await screen.findByRole('dialog', { name: 'Меню' })
		await fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(emitted()['update:isMobileOpen']).toEqual([[false]]))
	})

	it('после перехода закрытая панель событие не шлёт', async () => {
		setViewport(1200)
		const { emitted } = render(BaseSideBar, { props: { items: ITEMS, mobileBreakpoint: 'md', isMobileOpen: true } })

		await fireEvent.click(screen.getByRole('link', { name: 'Главная' }))
		expect(emitted()['update:isMobileOpen']).toBeUndefined()
	})
})

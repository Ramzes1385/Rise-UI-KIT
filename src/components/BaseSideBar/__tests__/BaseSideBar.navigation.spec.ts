import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { h, markRaw } from 'vue'

import type { BaseSideBarItemSlotProps } from '../model/BaseSideBar.types'
import BaseSideBar from '../ui/BaseSideBar.vue'
import BaseSideBarNavigation from '../ui/BaseSideBarNavigation.vue'
import { BASE_SIDEBAR_STUBS } from './BaseSideBar.test-utils'

describe('BaseSideBar navigation items', () => {
	it('рендерит items как навигацию', () => {
		render(BaseSideBar, {
			props: {
				title: 'Меню',
				linkComponent: 'a',
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
					{
						key: 'catalog',
						label: 'Каталог',
						icon: 'folder',
						to: '/catalog',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Главная')).toBeInTheDocument()
		expect(screen.getByText('Каталог')).toBeInTheDocument()
		expect(screen.getByText('Главная').closest('a')).toHaveAttribute('href', '/dashboard')
	})

	it('подсвечивает parent и current item по activePath', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				activePath: '/catalog/products',
				activeMatch: 'startsWith',
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						to: '/dashboard',
					},
					{
						key: 'catalog',
						label: 'Каталог',
						to: '/catalog',
						children: [
							{
								key: 'products',
								label: 'Товары',
								to: '/catalog/products',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Каталог').closest('.base-sidebar-nav__link')).toHaveClass(
			'base-sidebar-nav__link--parent-active',
		)
		expect(screen.getByText('Товары').closest('.base-sidebar-nav__link')).toHaveClass('base-sidebar-nav__link--current')
	})

	it('подсвечивает активный пункт по activeKey', () => {
		render(BaseSideBar, {
			props: {
				activeKey: 'orders',
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
					},
					{
						key: 'orders',
						label: 'Заказы',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Заказы').closest('.base-sidebar-nav__link')).toHaveClass('base-sidebar-nav__link--current')
	})

	it('вызывает item.click и emit itemClick', async () => {
		const click = vi.fn()
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'action',
						label: 'Действие',
						click,
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Действие' }))

		expect(click).toHaveBeenCalledTimes(1)
		expect(onItemClick).toHaveBeenCalledTimes(1)
	})

	it('не вызывает click для disabled item', async () => {
		const click = vi.fn()
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'disabled',
						label: 'Недоступно',
						isDisabled: true,
						click,
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const button = screen.getByRole('button', { name: 'Недоступно' })

		expect(button).toBeDisabled()

		await fireEvent.click(button)

		expect(click).not.toHaveBeenCalled()
		expect(onItemClick).not.toHaveBeenCalled()
	})

	it('navigation slot имеет приоритет над items в раскрытом состоянии', () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'from-items',
						label: 'Из items',
					},
				],
			},
			slots: {
				navigation: '<div>Кастомная навигация</div>',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Кастомная навигация')).toBeInTheDocument()
		expect(screen.queryByText('Из items')).not.toBeInTheDocument()
	})

	it('в collapsed режиме items отображаются иконками без label', () => {
		const { container } = render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const navigationIcon = container.querySelector('.base-sidebar__navigation [data-testid="base-icon"]')

		expect(navigationIcon).toHaveTextContent('home')
		expect(screen.queryByText('Главная')).not.toBeInTheDocument()
	})

	it('в collapsed режиме использует BaseTooltip для пунктов', () => {
		render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
					{
						key: 'catalog',
						label: 'Каталог',
						icon: 'folder',
						to: '/catalog',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const tooltips = screen.getAllByTestId('base-tooltip')

		expect(tooltips.some(tooltip => tooltip.getAttribute('data-tooltip-text') === 'Главная')).toBe(true)
		expect(tooltips.some(tooltip => tooltip.getAttribute('data-tooltip-text') === 'Каталог')).toBe(true)
		expect(tooltips.every(tooltip => tooltip.getAttribute('data-tooltip-position') === 'right')).toBe(true)
	})

	it('не использует title attribute для collapsed item', () => {
		render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByRole('link')).not.toHaveAttribute('title')
	})

	it('рендерит divider после пункта с hasDivider', () => {
		const { container } = render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						hasDivider: true,
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(container.querySelector('.base-sidebar-nav__divider')).toBeInTheDocument()
	})

	it('рендерит badge', () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'orders',
						label: 'Заказы',
						badge: 8,
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('8')).toBeInTheDocument()
		expect(screen.getByTestId('base-badge')).toBeInTheDocument()
	})

	it('рендерит item с children и to как ссылку и показывает children', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						key: 'catalog',
						label: 'Каталог',
						to: '/catalog',
						children: [
							{
								key: 'products',
								label: 'Товары',
								to: '/catalog/products',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Каталог').closest('a')).toHaveAttribute('href', '/catalog')
		expect(screen.getByText('Товары')).toBeInTheDocument()
		expect(screen.getByText('Каталог').closest('.base-sidebar-nav__link')).not.toHaveAttribute('aria-expanded')
		expect(
			screen.getByText('Каталог').closest('.base-sidebar-nav__link')?.querySelector('.base-sidebar-nav__chevron'),
		).toBeNull()
	})

	it('рендерит item с children без to как disclosure button', async () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const button = screen.getByRole('button', { name: 'Настройки' })

		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(screen.queryByText('Профиль')).not.toBeInTheDocument()

		await fireEvent.click(button)

		expect(button).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByText('Профиль')).toBeInTheDocument()

		await fireEvent.click(button)

		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(screen.queryByText('Профиль')).not.toBeInTheDocument()
	})

	it('автоматически раскрывает disclosure parent если активен child', () => {
		render(BaseSideBar, {
			props: {
				activeKey: 'profile',
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const button = screen.getByRole('button', { name: 'Настройки' })

		expect(button).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByText('Профиль')).toBeInTheDocument()
	})

	it('disabled disclosure item не раскрывается', async () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'disabled-group',
						label: 'Недоступный раздел',
						isDisabled: true,
						children: [
							{
								key: 'hidden-child',
								label: 'Скрытый пункт',
								to: '/hidden',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const button = screen.getByRole('button', { name: 'Недоступный раздел' })

		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.click(button)

		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(screen.queryByText('Скрытый пункт')).not.toBeInTheDocument()
	})

	it('в collapsed mode не показывает children у disclosure group', () => {
		render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						icon: 'settings',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.queryByText('Настройки')).not.toBeInTheDocument()
		expect(screen.queryByText('Профиль')).not.toBeInTheDocument()

		const tooltips = screen.getAllByTestId('base-tooltip')

		expect(tooltips.some(tooltip => tooltip.getAttribute('data-tooltip-text') === 'Настройки')).toBe(true)
	})

	it('в collapsed mode не показывает children у item с to', () => {
		const { container } = render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'catalog',
						label: 'Каталог',
						icon: 'folder',
						to: '/catalog',
						children: [
							{
								key: 'products',
								label: 'Товары',
								to: '/catalog/products',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.queryByText('Каталог')).not.toBeInTheDocument()
		expect(screen.queryByText('Товары')).not.toBeInTheDocument()
		expect(container.querySelector('.base-sidebar__navigation [data-testid="base-icon"]')).toHaveTextContent('folder')
	})

	it('сохраняет item.click и emit itemClick для disclosure group', async () => {
		const click = vi.fn()
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						click,
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))

		expect(click).toHaveBeenCalledTimes(1)
		expect(onItemClick).toHaveBeenCalledTimes(1)
	})

	it('добавляет expanded class на chevron при раскрытии disclosure group', async () => {
		const { container } = render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const button = screen.getByRole('button', { name: 'Настройки' })
		const chevron = container.querySelector('.base-sidebar-nav__chevron')

		expect(chevron).not.toHaveClass('base-sidebar-nav__chevron--expanded')

		await fireEvent.click(button)

		expect(screen.getByText('Профиль')).toBeInTheDocument()
		expect(chevron).toHaveClass('base-sidebar-nav__chevron--expanded')
	})

	it('сохраняет footer в разметке в collapsed mode', () => {
		render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
				],
			},
			slots: {
				footer: '<div data-testid="sidebar-footer">Admin Owner</div>',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
		expect(screen.getByTestId('sidebar-footer').closest('.base-sidebar__footer')).toBeInTheDocument()
	})

	it('подсвечивает item с isActive: true как current', () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'manual',
						label: 'Активный вручную',
						isActive: true,
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Активный вручную').closest('.base-sidebar-nav__link')).toHaveClass(
			'base-sidebar-nav__link--current',
		)
	})

	it('эмитит itemClick при клике на child item disclosure group', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
		await fireEvent.click(screen.getByRole('link', { name: 'Профиль' }))

		expect(onItemClick).toHaveBeenCalledTimes(2)
		expect(onItemClick.mock.calls[1][0].key).toBe('profile')
	})

	it('пробрасывает item slot через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :link-component="'a'">
            <template #item="{ item }">
              <div data-testid="custom-item">{{ item.label }}</div>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('custom-item')).toBeInTheDocument()
	})

	it('пробрасывает слоты icon, label, badge через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :link-component="'a'">
            <template #icon="{ item }">
              <span data-testid="custom-icon">{{ item.icon }}</span>
            </template>
            <template #label="{ item }">
              <span data-testid="custom-label">{{ item.label }}</span>
            </template>
            <template #badge="{ item }">
              <span data-testid="custom-badge">{{ item.badge }}</span>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
								badge: 5,
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
		expect(screen.getByTestId('custom-label')).toBeInTheDocument()
		expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
	})

	it('в collapsed mode рендерит item slot через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :is-collapsed="true" :link-component="'a'">
            <template #item="{ item }">
              <div data-testid="collapsed-custom-item">{{ item.label }}</div>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('collapsed-custom-item')).toBeInTheDocument()
	})

	it('рендерит item с object to через custom linkComponent', () => {
		const RouterLinkStub = markRaw({
			name: 'RouterLink',
			props: ['to'],
			template: '<a data-testid="router-link" :href="JSON.stringify(to)"><slot /></a>',
		})

		render(BaseSideBar, {
			props: {
				linkComponent: RouterLinkStub,
				items: [
					{
						label: 'Маршрут',
						to: { name: 'dashboard', params: { id: 1 } },
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const link = screen.getByTestId('router-link')

		expect(link).toBeInTheDocument()
		expect(link.getAttribute('href')).toContain('dashboard')
	})

	it('использует object to как key когда key не задан', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						label: 'Объектный маршрут',
						to: { name: 'settings' },
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Объектный маршрут')).toBeInTheDocument()
		expect(screen.getByText('Объектный маршрут').closest('a')).toHaveAttribute('href', '#')
	})

	it('подсвечивает item с isActive: true как current', () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'manual',
						label: 'Активный вручную',
						isActive: true,
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Активный вручную').closest('.base-sidebar-nav__link')).toHaveClass(
			'base-sidebar-nav__link--current',
		)
	})

	it('эмитит itemClick при клике на child item disclosure group', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				items: [
					{
						key: 'settings',
						label: 'Настройки',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								to: '/settings/profile',
							},
						],
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
		await fireEvent.click(screen.getByRole('link', { name: 'Профиль' }))

		expect(onItemClick).toHaveBeenCalledTimes(2)
		expect(onItemClick.mock.calls[1][0].key).toBe('profile')
	})

	it('пробрасывает item slot через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :link-component="'a'">
            <template #item="{ item }">
              <div data-testid="custom-item">{{ item.label }}</div>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('custom-item')).toBeInTheDocument()
	})

	it('пробрасывает слоты icon, label, badge через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :link-component="'a'">
            <template #icon="{ item }">
              <span data-testid="custom-icon">{{ item.icon }}</span>
            </template>
            <template #label="{ item }">
              <span data-testid="custom-label">{{ item.label }}</span>
            </template>
            <template #badge="{ item }">
              <span data-testid="custom-badge">{{ item.badge }}</span>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
								badge: 5,
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
		expect(screen.getByTestId('custom-label')).toBeInTheDocument()
		expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
	})

	it('в collapsed mode рендерит item slot через BaseSideBar', () => {
		render(
			{
				components: { BaseSideBar },
				template: `
          <BaseSideBar :items="items" :is-collapsed="true" :link-component="'a'">
            <template #item="{ item }">
              <div data-testid="collapsed-custom-item">{{ item.label }}</div>
            </template>
          </BaseSideBar>
        `,
				data() {
					return {
						items: [
							{
								key: 'dashboard',
								label: 'Главная',
								icon: 'home',
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		expect(screen.getByTestId('collapsed-custom-item')).toBeInTheDocument()
	})

	it('рендерит item с object to через custom linkComponent', () => {
		const RouterLinkStub = markRaw({
			name: 'RouterLink',
			props: ['to'],
			template: '<a data-testid="router-link" :href="JSON.stringify(to)"><slot /></a>',
		})
		render(BaseSideBar, {
			props: {
				linkComponent: RouterLinkStub,
				items: [
					{
						label: 'Маршрут',
						to: { name: 'dashboard', params: { id: 1 } },
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const link = screen.getByTestId('router-link')

		expect(link).toBeInTheDocument()
		expect(link.getAttribute('href')).toContain('dashboard')
	})

	it('использует object to как key когда key не задан', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						label: 'Объектный маршрут',
						to: { name: 'settings' },
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByText('Объектный маршрут')).toBeInTheDocument()
		expect(screen.getByText('Объектный маршрут').closest('a')).toHaveAttribute('href', '#')
	})

	it('рендерит item без icon и badge', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						key: 'plain',
						label: 'Простой пункт',
						to: '/plain',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const link = screen.getByText('Простой пункт').closest('a')
		expect(link).toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__icon')).not.toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__badge')).not.toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__chevron')).not.toBeInTheDocument()
	})

	it('рендерит nested children без slot forwarding', async () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						key: 'parent',
						label: 'Родитель',
						children: [
							{
								key: 'child1',
								label: 'Дочерний 1',
								to: '/parent/child1',
							},
							{
								key: 'child2',
								label: 'Дочерний 2',
								to: '/parent/child2',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const parentButton = screen.getByRole('button', { name: /Родитель/ })
		expect(parentButton).toBeInTheDocument()

		await fireEvent.click(parentButton)

		expect(screen.getByText('Дочерний 1')).toBeInTheDocument()
		expect(screen.getByText('Дочерний 2')).toBeInTheDocument()
	})

	it('рендерит item без icon и badge', () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						key: 'plain',
						label: 'Простой пункт',
						to: '/plain',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const link = screen.getByText('Простой пункт').closest('a')
		expect(link).toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__icon')).not.toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__badge')).not.toBeInTheDocument()
		expect(link?.querySelector('.base-sidebar-nav__chevron')).not.toBeInTheDocument()
	})

	it('рендерит nested children без slot forwarding', async () => {
		render(BaseSideBar, {
			props: {
				linkComponent: 'a',
				items: [
					{
						key: 'parent',
						label: 'Родитель',
						children: [
							{
								key: 'child1',
								label: 'Дочерний 1',
								to: '/parent/child1',
							},
							{
								key: 'child2',
								label: 'Дочерний 2',
								to: '/parent/child2',
							},
						],
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const parentButton = screen.getByRole('button', { name: /Родитель/ })
		expect(parentButton).toBeInTheDocument()

		await fireEvent.click(parentButton)

		expect(screen.getByText('Дочерний 1')).toBeInTheDocument()
		expect(screen.getByText('Дочерний 2')).toBeInTheDocument()
	})

	it('использует on-click из label slot props', async () => {
		const onItemClick = vi.fn()

		const WrapperComponent = {
			components: { BaseSideBar },
			template: `
        <BaseSideBar 
          :items="items" 
          :link-component="'a'"
          @item-click="onItemClick">
          <template #label="{ item, onClick }">
            <span data-testid="custom-label" @click="onClick">{{ item.label }}</span>
          </template>
        </BaseSideBar>
      `,
			data() {
				return {
					items: [
						{
							key: 'test',
							label: 'Тестовый пункт',
							to: '/test',
						},
					],
				}
			},
			methods: {
				onItemClick,
			},
		}

		render(WrapperComponent, {
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const label = screen.getByTestId('custom-label')
		await fireEvent.click(label)

		expect(onItemClick).toHaveBeenCalled()
	})

	it('использует on-click из badge slot props', async () => {
		const onItemClick = vi.fn()

		const WrapperComponent = {
			components: { BaseSideBar },
			template: `
        <BaseSideBar 
          :items="items" 
          :link-component="'a'"
          @item-click="onItemClick">
          <template #badge="{ item, onClick }">
            <span data-testid="custom-badge" @click="onClick">{{ item.badge }}</span>
          </template>
        </BaseSideBar>
      `,
			data() {
				return {
					items: [
						{
							key: 'test',
							label: 'Тестовый пункт',
							badge: 5,
							to: '/test',
						},
					],
				}
			},
			methods: {
				onItemClick,
			},
		}

		render(WrapperComponent, {
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const badge = screen.getByTestId('custom-badge')
		await fireEvent.click(badge)

		expect(onItemClick).toHaveBeenCalled()
	})

	it('использует on-click из label slot props', async () => {
		const onItemClick = vi.fn()

		const WrapperComponent = {
			components: { BaseSideBar },
			template: `
        <BaseSideBar 
          :items="items" 
          :link-component="'a'"
          @item-click="onItemClick">
          <template #label="{ item, onClick }">
            <span data-testid="custom-label" @click="onClick">{{ item.label }}</span>
          </template>
        </BaseSideBar>
      `,
			data() {
				return {
					items: [
						{
							key: 'test',
							label: 'Тестовый пункт',
							to: '/test',
						},
					],
				}
			},
			methods: {
				onItemClick,
			},
		}

		render(WrapperComponent, {
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const label = screen.getByTestId('custom-label')
		await fireEvent.click(label)

		expect(onItemClick).toHaveBeenCalled()
	})

	it('использует on-click из badge slot props', async () => {
		const onItemClick = vi.fn()

		const WrapperComponent = {
			components: { BaseSideBar },
			template: `
        <BaseSideBar 
          :items="items" 
          :link-component="'a'"
          @item-click="onItemClick">
          <template #badge="{ item, onClick }">
            <span data-testid="custom-badge" @click="onClick">{{ item.badge }}</span>
          </template>
        </BaseSideBar>
      `,
			data() {
				return {
					items: [
						{
							key: 'test',
							label: 'Тестовый пункт',
							badge: 5,
							to: '/test',
						},
					],
				}
			},
			methods: {
				onItemClick,
			},
		}

		render(WrapperComponent, {
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const badge = screen.getByTestId('custom-badge')
		await fireEvent.click(badge)

		expect(onItemClick).toHaveBeenCalled()
	})

	it('прокидывает onClick из item slot в раскрытом режиме', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBarNavigation, {
			props: {
				items: [
					{
						key: 'custom-item',
						label: 'Кастомный item',
						to: '/custom-item',
					},
				],
				onItemClick,
			},
			slots: {
				item: (slotProps: BaseSideBarItemSlotProps) =>
					h(
						'span',
						{
							'data-testid': 'expanded-item-slot',
							'data-level': String(slotProps.level),
							'data-active': String(slotProps.isActive),
							'data-current': String(slotProps.isCurrent),
							'data-collapsed': String(slotProps.isCollapsed),
							'data-has-children': String(slotProps.hasChildren),
							onClick: (event: MouseEvent) => {
								event.stopPropagation()
								slotProps.onClick(event)
							},
						},
						slotProps.item.label,
					),
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const itemSlot = screen.getByTestId('expanded-item-slot')

		expect(itemSlot).toHaveAttribute('data-level', '0')
		expect(itemSlot).toHaveAttribute('data-active', 'false')
		expect(itemSlot).toHaveAttribute('data-current', 'false')
		expect(itemSlot).toHaveAttribute('data-collapsed', 'false')
		expect(itemSlot).toHaveAttribute('data-has-children', 'false')

		await fireEvent.click(itemSlot)

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('custom-item')
	})

	it('прокидывает onClick из icon slot в раскрытом режиме', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBarNavigation, {
			props: {
				activeKey: 'icon-item',
				items: [
					{
						key: 'icon-item',
						label: 'Пункт с иконкой',
						icon: 'home',
						to: '/icon-item',
					},
				],
				onItemClick,
			},
			slots: {
				icon: (slotProps: BaseSideBarItemSlotProps) =>
					h(
						'span',
						{
							'data-testid': 'expanded-icon-slot',
							'data-icon': slotProps.item.icon,
							'data-level': String(slotProps.level),
							'data-active': String(slotProps.isActive),
							'data-current': String(slotProps.isCurrent),
							'data-collapsed': String(slotProps.isCollapsed),
							'data-has-children': String(slotProps.hasChildren),
							onClick: (event: MouseEvent) => {
								event.stopPropagation()
								slotProps.onClick(event)
							},
						},
						slotProps.item.icon,
					),
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const iconSlot = screen.getByTestId('expanded-icon-slot')

		expect(iconSlot).toHaveAttribute('data-icon', 'home')
		expect(iconSlot).toHaveAttribute('data-level', '0')
		expect(iconSlot).toHaveAttribute('data-active', 'true')
		expect(iconSlot).toHaveAttribute('data-current', 'true')
		expect(iconSlot).toHaveAttribute('data-collapsed', 'false')
		expect(iconSlot).toHaveAttribute('data-has-children', 'false')

		await fireEvent.click(iconSlot)

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('icon-item')
	})

	it('прокидывает onClick из item slot в collapsed режиме', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBarNavigation, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'collapsed-custom-item',
						label: 'Свёрнутый item',
						to: '/collapsed-custom-item',
					},
				],
				onItemClick,
			},
			slots: {
				item: (slotProps: BaseSideBarItemSlotProps) =>
					h(
						'span',
						{
							'data-testid': 'collapsed-item-slot',
							'data-level': String(slotProps.level),
							'data-active': String(slotProps.isActive),
							'data-current': String(slotProps.isCurrent),
							'data-collapsed': String(slotProps.isCollapsed),
							'data-has-children': String(slotProps.hasChildren),
							onClick: (event: MouseEvent) => {
								event.stopPropagation()
								slotProps.onClick(event)
							},
						},
						slotProps.item.label,
					),
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const itemSlot = screen.getByTestId('collapsed-item-slot')

		expect(itemSlot).toHaveAttribute('data-level', '0')
		expect(itemSlot).toHaveAttribute('data-active', 'false')
		expect(itemSlot).toHaveAttribute('data-current', 'false')
		expect(itemSlot).toHaveAttribute('data-collapsed', 'true')
		expect(itemSlot).toHaveAttribute('data-has-children', 'false')

		await fireEvent.click(itemSlot)

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('collapsed-custom-item')
	})

	it('прокидывает onClick из icon slot в collapsed режиме', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBarNavigation, {
			props: {
				isCollapsed: true,
				activeKey: 'collapsed-icon-item',
				items: [
					{
						key: 'collapsed-icon-item',
						label: 'Свёрнутый пункт с иконкой',
						icon: 'settings',
						to: '/collapsed-icon-item',
					},
				],
				onItemClick,
			},
			slots: {
				icon: (slotProps: BaseSideBarItemSlotProps) =>
					h(
						'span',
						{
							'data-testid': 'collapsed-icon-slot',
							'data-icon': slotProps.item.icon,
							'data-level': String(slotProps.level),
							'data-active': String(slotProps.isActive),
							'data-current': String(slotProps.isCurrent),
							'data-collapsed': String(slotProps.isCollapsed),
							'data-has-children': String(slotProps.hasChildren),
							onClick: (event: MouseEvent) => {
								event.stopPropagation()
								slotProps.onClick(event)
							},
						},
						slotProps.item.icon,
					),
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const iconSlot = screen.getByTestId('collapsed-icon-slot')

		expect(iconSlot).toHaveAttribute('data-icon', 'settings')
		expect(iconSlot).toHaveAttribute('data-level', '0')
		expect(iconSlot).toHaveAttribute('data-active', 'true')
		expect(iconSlot).toHaveAttribute('data-current', 'true')
		expect(iconSlot).toHaveAttribute('data-collapsed', 'true')
		expect(iconSlot).toHaveAttribute('data-has-children', 'false')

		await fireEvent.click(iconSlot)

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('collapsed-icon-item')
	})
	it('эмитит itemClick при клике по item в collapsed mode', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						to: '/dashboard',
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('link'))

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('dashboard')
	})

	it('пробрасывает item slot во вложенный BaseSideBarNavigation', async () => {
		render(
			{
				components: { BaseSideBar },
				template: `
				<BaseSideBar :items="items" :link-component="'a'">
					<template #item="{ item, level }">
						<span
							:data-testid="'custom-item-' + item.key"
							:data-level="level"
						>
							{{ item.label }}
						</span>
					</template>
				</BaseSideBar>
			`,
				data() {
					return {
						items: [
							{
								key: 'parent',
								label: 'Родитель',
								children: [
									{
										key: 'child',
										label: 'Дочерний пункт',
										to: '/parent/child',
									},
								],
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		await fireEvent.click(screen.getByTestId('custom-item-parent').closest('button')!)

		expect(screen.getByTestId('custom-item-child')).toBeInTheDocument()
		expect(screen.getByTestId('custom-item-child')).toHaveAttribute('data-level', '1')
	})

	it('пробрасывает icon, label и badge slots во вложенный BaseSideBarNavigation', async () => {
		render(
			{
				components: { BaseSideBar },
				template: `
				<BaseSideBar :items="items" :link-component="'a'">
					<template #icon="{ item, level }">
						<span
							:data-testid="'custom-icon-' + item.key"
							:data-level="level"
						>
							{{ item.icon }}
						</span>
					</template>

					<template #label="{ item, level }">
						<span
							:data-testid="'custom-label-' + item.key"
							:data-level="level"
						>
							{{ item.label }}
						</span>
					</template>

					<template #badge="{ item, level }">
						<span
							:data-testid="'custom-badge-' + item.key"
							:data-level="level"
						>
							{{ item.badge }}
						</span>
					</template>
				</BaseSideBar>
			`,
				data() {
					return {
						items: [
							{
								key: 'parent',
								label: 'Родитель',
								children: [
									{
										key: 'child',
										label: 'Дочерний пункт',
										icon: 'child-icon',
										badge: 3,
										to: '/parent/child',
									},
								],
							},
						],
					}
				},
			},
			{
				global: {
					stubs: BASE_SIDEBAR_STUBS,
				},
			},
		)

		await fireEvent.click(screen.getByRole('button', { name: /Родитель/ }))

		expect(screen.getByTestId('custom-icon-child')).toBeInTheDocument()
		expect(screen.getByTestId('custom-icon-child')).toHaveAttribute('data-level', '1')

		expect(screen.getByTestId('custom-label-child')).toBeInTheDocument()
		expect(screen.getByTestId('custom-label-child')).toHaveAttribute('data-level', '1')

		expect(screen.getByTestId('custom-badge-child')).toBeInTheDocument()
		expect(screen.getByTestId('custom-badge-child')).toHaveAttribute('data-level', '1')
	})
	it('в collapsed mode покрывает active/current/parent-active, item без icon и click по disclosure', async () => {
		const onItemClick = vi.fn()

		const { container } = render(BaseSideBarNavigation, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
						isActive: true,
					},
					{
						key: 'settings',
						label: 'Настройки',
						icon: 'settings',
						children: [
							{
								key: 'profile',
								label: 'Профиль',
								isActive: true,
								to: '/settings/profile',
							},
						],
					},
					{
						key: 'plain',
						label: 'Без иконки',
						to: '/plain',
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const links = container.querySelectorAll('.base-sidebar-nav__link')
		const currentLink = links[0]
		const disclosureLink = links[1]
		const noIconLink = links[2]

		expect(currentLink).toHaveClass('base-sidebar-nav__link--active')
		expect(currentLink).toHaveClass('base-sidebar-nav__link--current')
		expect(currentLink).toHaveClass('base-sidebar-nav__link--collapsed')

		expect(disclosureLink).toHaveClass('base-sidebar-nav__link--active')
		expect(disclosureLink).toHaveClass('base-sidebar-nav__link--parent-active')
		expect(disclosureLink).toHaveClass('base-sidebar-nav__link--collapsed')

		expect(noIconLink.querySelector('.base-sidebar-nav__icon')).toBeNull()

		await fireEvent.click(disclosureLink)

		expect(onItemClick).toHaveBeenCalledTimes(1)
		expect(onItemClick.mock.calls[0][0].key).toBe('settings')
		expect(container.querySelector('.base-sidebar-nav__children')).not.toBeInTheDocument()
	})
	it('использует label как key когда key и to не заданы', () => {
		render(BaseSideBar, {
			props: {
				items: [
					{
						label: 'Пункт без key и to',
					},
				],
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByRole('button', { name: 'Пункт без key и to' })).toBeInTheDocument()
	})
})

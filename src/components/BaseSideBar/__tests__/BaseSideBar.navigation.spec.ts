import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import BaseSideBar from '../ui/BaseSideBar.vue'

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
	})
})

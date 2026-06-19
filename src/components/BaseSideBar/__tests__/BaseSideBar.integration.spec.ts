import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import BaseSideBar from '../ui/BaseSideBar.vue'
import { BASE_SIDEBAR_STUBS } from './BaseSideBar.test-utils'

describe('BaseSideBar integration', () => {
	it('эмитит collapse при клике на кнопку сворачивания', async () => {
		const { emitted } = render(BaseSideBar, {
			props: {
				title: 'Навигация',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		expect(emitted()).toHaveProperty('collapse')
		expect(emitted()).toHaveProperty('update:isCollapsed')
		expect(emitted()['update:isCollapsed']).toEqual([[true]])
	})

	it('эмитит expand при клике на кнопку разворачивания', async () => {
		const { emitted } = render(BaseSideBar, {
			props: {
				title: 'Навигация',
				isCollapsed: true,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть' }))

		expect(emitted()).toHaveProperty('expand')
		expect(emitted()).toHaveProperty('update:isCollapsed')
		expect(emitted()['update:isCollapsed']).toEqual([[false]])
	})

	it('в uncontrolled режиме обновляет внутреннее collapsed состояние', async () => {
		const { container } = render(BaseSideBar, {
			props: {
				title: 'Навигация',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const sidebar = container.querySelector('.base-side-bar')

		expect(sidebar).not.toHaveClass('base-side-bar--collapsed')

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		expect(sidebar).toHaveClass('base-side-bar--collapsed')
		expect(screen.getByRole('button', { name: 'Развернуть' })).toBeInTheDocument()
	})

	it('в controlled режиме не меняет класс без обновления prop извне', async () => {
		const { container, emitted } = render(BaseSideBar, {
			props: {
				title: 'Навигация',
				isCollapsed: false,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const sidebar = container.querySelector('.base-side-bar')

		expect(sidebar).not.toHaveClass('base-side-bar--collapsed')

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		expect(emitted()['update:isCollapsed']).toEqual([[true]])
		expect(sidebar).not.toHaveClass('base-side-bar--collapsed')
	})

	it('обновляет aria-label при изменении isCollapsed извне', async () => {
		const { rerender } = render(BaseSideBar, {
			props: {
				title: 'Тест',
				isCollapsed: false,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getByRole('button', { name: 'Свернуть' })).toBeInTheDocument()

		await rerender({
			title: 'Тест',
			isCollapsed: true,
		})

		expect(screen.getByRole('button', { name: 'Развернуть' })).toBeInTheDocument()
	})

	it('не рендерит кнопку сворачивания при isCollapsible=false', () => {
		render(BaseSideBar, {
			props: {
				title: 'Навигация',
				isCollapsible: false,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.queryByRole('button', { name: 'Свернуть' })).not.toBeInTheDocument()
	})

	it('рендерит navigation items и эмитит itemClick', async () => {
		const onItemClick = vi.fn()

		render(BaseSideBar, {
			props: {
				title: 'Навигация',
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						to: '/dashboard',
					},
				],
				onItemClick,
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		await fireEvent.click(screen.getByRole('link', { name: 'Главная' }))

		expect(onItemClick).toHaveBeenCalledTimes(1)
	})

	it('не показывает navigation slot в collapsed режиме, если есть items', () => {
		const { container } = render(BaseSideBar, {
			props: {
				isCollapsed: true,
				items: [
					{
						key: 'dashboard',
						label: 'Главная',
						icon: 'home',
					},
				],
			},
			slots: {
				navigation: '<div>Custom navigation</div>',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		const navigationIcon = container.querySelector('.base-side-bar__navigation [data-testid="base-icon"]')

		expect(screen.queryByText('Custom navigation')).not.toBeInTheDocument()
		expect(navigationIcon).toHaveTextContent('home')
	})

	it('скрывает body и footer при loading', () => {
		render(BaseSideBar, {
			props: {
				title: 'Навигация',
				isLoading: true,
			},
			slots: {
				default: '<div>Body content</div>',
				footer: '<div>Footer content</div>',
			},
			global: {
				stubs: BASE_SIDEBAR_STUBS,
			},
		})

		expect(screen.getAllByTestId('base-skeleton')).toHaveLength(4)
		expect(screen.queryByText('Body content')).not.toBeInTheDocument()
		expect(screen.queryByText('Footer content')).not.toBeInTheDocument()
	})
})

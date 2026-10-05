import '@testing-library/jest-dom/vitest'
import BaseTabs from '../ui/BaseTabs.vue'
import { createUiKitPlugin } from '@/plugin'
import type { TabItem } from '../types/BaseTabs.types'
import { render, screen, waitFor } from '@testing-library/vue'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация', icon: 'settings' },
	{ id: 'specs', label: 'Характеристики' },
]

const PANEL = { default: '<p>Содержимое</p>' }

describe('BaseTabs: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS }, slots: PANEL })

		expect(container.querySelector('.base-tabs')).toHaveAttribute('class', 'base-tabs base-tabs--underline')
		expect(screen.getByRole('tablist')).toHaveAttribute('class', 'base-tabs__list')
		expect(container.querySelector('.base-tabs__nav')).toHaveAttribute('class', 'base-tabs__nav')
		expect(container.querySelector('.base-tabs__label')).toHaveAttribute('class', 'base-tabs__label')
		expect(container.querySelector('.base-tabs__icon')).toHaveAttribute('class', 'base-tabs__icon')
		expect(screen.getByRole('tabpanel')).toHaveAttribute('class', 'base-tabs__content')
		expect(container.querySelector('.base-tabs__panel')).toHaveAttribute('class', 'base-tabs__panel')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseTabs, {
			props: {
				modelValue: 'info',
				items: TABS,
				variant: 'pills',
				customClass: { root: 'own-root', list: 'own-list', tab: 'own-tab' },
				ui: {
					root: 'u-root',
					nav: 'u-nav',
					list: 'u-list',
					indicator: 'u-indicator',
					tab: 'u-tab',
					icon: 'u-icon',
					label: 'u-label',
					content: 'u-content',
					panel: 'u-panel',
				},
			},
			slots: PANEL,
		})

		expect(container.querySelector('.base-tabs')).toHaveClass('base-tabs', 'u-root', 'own-root', 'base-tabs--pills')
		expect(container.querySelector('.base-tabs__nav')).toHaveClass('u-nav')
		expect(screen.getByRole('tablist')).toHaveClass('base-tabs__list', 'u-list', 'own-list')
		await waitFor(() => expect(container.querySelector('.base-tabs__indicator')).toHaveClass('base-tabs__indicator', 'u-indicator'))
		expect(screen.getByRole('tab', { name: 'Информация' })).toHaveClass('base-tabs__tab', 'u-tab', 'own-tab', 'base-tabs__tab--active')
		expect(container.querySelector('.base-tabs__icon')).toHaveClass('u-icon')
		expect(container.querySelector('.base-tabs__label')).toHaveClass('u-label')
		expect(screen.getByRole('tabpanel')).toHaveClass('base-tabs__content', 'u-content')
		expect(container.querySelector('.base-tabs__panel')).toHaveClass('u-panel')
	})

	it('ui.scroll-btn — у кнопок прокрутки', async () => {
		const { container } = render(BaseTabs, {
			props: { modelValue: 'info', items: TABS, isScrollable: true, ui: { 'scroll-btn': 'u-scroll' } },
		})
		const list = screen.getByRole('tablist')
		Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 600 })
		Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })
		list.dispatchEvent(new Event('scroll'))

		await vi.waitFor(() =>
			expect(container.querySelector('.base-tabs__scroll-btn--right')).toHaveClass('base-tabs__scroll-btn', 'u-scroll'),
		)
	})

	it('классы из defaults.BaseTabs.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTabs, {
			props: { modelValue: 'info', items: TABS, ui: { list: 'own-list' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTabs: { ui: { root: 'app-root', list: 'app-list' } } } })] },
		})

		expect(container.querySelector('.base-tabs')).toHaveClass('app-root')
		expect(screen.getByRole('tablist')).toHaveAttribute('class', 'base-tabs__list app-list own-list')
	})
})

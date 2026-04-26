/**
 * Unit-тесты для BaseTabs.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { TabItem } from './BaseTabs.types'
import BaseTabs from './BaseTabs.vue'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы', isDisabled: true },
]

describe('BaseTabs unit', () => {
	describe('рендер', () => {
		it('должен рендерить табы', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			expect(container.querySelector('.base-tabs')).toBeInTheDocument()
		})

		it('должен рендерить все табы', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const tabs = container.querySelectorAll('.base-tabs__tab')
			expect(tabs).toHaveLength(TABS.length)
		})

		it('должен рендерить текст каждого таба', () => {
			render(BaseTabs, { props: { modelValue: 'info', items: TABS } })

			expect(screen.getByText('Информация')).toBeInTheDocument()
			expect(screen.getByText('Характеристики')).toBeInTheDocument()
			expect(screen.getByText('Отзывы')).toBeInTheDocument()
		})
	})

	describe('пропс modelValue', () => {
		it('должен добавлять класс --active на выбранный таб', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const activeTab = container.querySelector('.base-tabs__tab--active')
			expect(activeTab).toBeInTheDocument()
			expect(activeTab?.textContent).toContain('Информация')
		})

		it('должен устанавливать aria-selected=true на активный таб', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const activeTab = container.querySelector('.base-tabs__tab--active')
			expect(activeTab?.getAttribute('aria-selected')).toBe('true')
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --underline по умолчанию', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--underline')).toBe(true)
		})

		it('должен применять модификатор --pills когда variant=pills', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, variant: 'pills' },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--pills')).toBe(true)
		})

		it('должен применять модификатор --rounded когда variant=rounded', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, variant: 'rounded' },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--rounded')).toBe(true)
		})

		it('должен применять модификатор --arc когда variant=arc', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, variant: 'arc' },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--arc')).toBe(true)
		})
	})

	describe('пропс isFullWidth', () => {
		it('должен добавлять класс --full-width когда isFullWidth=true', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, isFullWidth: true },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--full-width')).toBe(true)
		})
	})

	describe('отключённый таб', () => {
		it('должен добавлять класс --disabled на BaseButton отключённого таба', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const disabledButtons = container.querySelectorAll('.base-button--disabled')
			expect(disabledButtons).toHaveLength(1)
		})

		it('должен устанавливать disabled на кнопку отключённого таба', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const disabledButton = container.querySelector<HTMLButtonElement>('.base-button--disabled')
			expect(disabledButton?.disabled).toBe(true)
		})
	})

	describe('role', () => {
		it('должен устанавливать role=tablist на список', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			expect(container.querySelector('.base-tabs__list')?.getAttribute('role')).toBe('tablist')
		})

		it('должен устанавливать role=tab на каждый таб', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			const tabs = container.querySelectorAll('[role="tab"]')
			expect(tabs).toHaveLength(TABS.length)
		})
	})
})

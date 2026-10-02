import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { render, screen } from '@testing-library/vue'

global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

import BaseTabs from '../ui/BaseTabs.vue'
import type { TabItem } from '../types/BaseTabs.types'

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

	describe('пропс isScrollable', () => {
		it('не должен добавлять класс --scrollable по умолчанию', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--scrollable')).toBe(false)
		})

		it('должен добавлять класс --scrollable когда isScrollable=true', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, isScrollable: true },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('base-tabs--scrollable')).toBe(true)
		})

		it('должен рендерить навигацию __nav', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			expect(container.querySelector('.base-tabs__nav')).toBeInTheDocument()
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

	describe('кнопки прокрутки', () => {
		it('должны иметь доступные имена', async () => {
			const metrics = { scrollLeft: 10, scrollWidth: 100, clientWidth: 50 }
			const originals = Object.fromEntries(
				Object.keys(metrics).map(key => [key, Object.getOwnPropertyDescriptor(HTMLElement.prototype, key)]),
			)

			for (const [key, value] of Object.entries(metrics)) {
				Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get: () => value })
			}

			try {
				render(BaseTabs, {
					props: { modelValue: 'info', items: TABS, isScrollable: true },
				})
				await nextTick()
				await nextTick()

				expect(screen.getByRole('button', { name: 'Прокрутить вкладки влево' })).toBeInTheDocument()
				expect(screen.getByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeInTheDocument()
			} finally {
				for (const [key, descriptor] of Object.entries(originals)) {
					if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor)
					else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key]
				}
			}
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, sizeScale: 100 },
			})

			const el = container.querySelector('.base-tabs') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, sizeScale: 150 },
			})

			const el = container.querySelector('.base-tabs') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс color', () => {
		it('должен задавать кастомный цвет через style', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, color: { text: { base: '#ff0000' } } },
			})

			expect(container.querySelector('.base-tabs')?.getAttribute('style')).toContain('--custom-text: #ff0000')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS, customClass: 'custom-tabs-root' },
			})

			expect(container.querySelector('.base-tabs')?.classList.contains('custom-tabs-root')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', async () => {
			const originalScrollLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollLeft')
			const originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
			const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')

			Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
				configurable: true,
				get() {
					return 10
				},
			})
			Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
				configurable: true,
				get() {
					return 100
				},
			})
			Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
				configurable: true,
				get() {
					return 50
				},
			})

			try {
				const { container } = render(BaseTabs, {
					props: {
						modelValue: 'info',
						items: [{ id: 'info', label: 'Информация', icon: 'home' }],
						isScrollable: true,
						customClass: {
							root: 'custom-root',
							nav: 'custom-nav',
							scrollBtn: 'custom-scroll-btn',
							list: 'custom-list',
							tab: 'custom-tab',
							icon: 'custom-icon',
							label: 'custom-label',
							content: 'custom-content',
						},
					},
				})

				await nextTick()
				await nextTick()

				expect(container.querySelector('.base-tabs')?.classList.contains('custom-root')).toBe(true)
				expect(container.querySelector('.base-tabs__nav')?.classList.contains('custom-nav')).toBe(true)
				expect(container.querySelector('.base-tabs__scroll-btn')?.classList.contains('custom-scroll-btn')).toBe(true)
				expect(container.querySelector('.base-tabs__list')?.classList.contains('custom-list')).toBe(true)
				expect(container.querySelector('.base-tabs__tab')?.classList.contains('custom-tab')).toBe(true)
				expect(container.querySelector('.base-tabs__icon')?.classList.contains('custom-icon')).toBe(true)
				expect(container.querySelector('.base-tabs__label')?.classList.contains('custom-label')).toBe(true)
				expect(container.querySelector('.base-tabs__content')?.classList.contains('custom-content')).toBe(true)
			} finally {
				if (originalScrollLeft) {
					Object.defineProperty(HTMLElement.prototype, 'scrollLeft', originalScrollLeft)
				} else {
					delete (HTMLElement.prototype as any).scrollLeft
				}

				if (originalScrollWidth) {
					Object.defineProperty(HTMLElement.prototype, 'scrollWidth', originalScrollWidth)
				} else {
					delete (HTMLElement.prototype as any).scrollWidth
				}

				if (originalClientWidth) {
					Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth)
				} else {
					delete (HTMLElement.prototype as any).clientWidth
				}
			}
		})
	})

	describe('слоты panel-<id>', () => {
		it('выбранная вкладка со своим слотом показывает его, остальные — default', async () => {
			const { rerender } = render(BaseTabs, {
				props: { modelValue: 'specs', items: TABS },
				slots: { default: 'Общая панель', 'panel-specs': 'Панель характеристик' },
			})
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Панель характеристик')
			await rerender({ modelValue: 'info', items: TABS })
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Общая панель')
		})

		it('только слоты panel-<id>: панель связана с вкладкой, у вкладки без слота панель пустая', async () => {
			const { rerender } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
				slots: { 'panel-info': 'О товаре' },
			})
			const panel = screen.getByRole('tabpanel')
			expect(panel).toHaveTextContent('О товаре')
			expect(screen.getByRole('tab', { name: 'Информация' })).toHaveAttribute('aria-controls', panel.id)
			await rerender({ modelValue: 'specs', items: TABS })
			await nextTick()
			expect(screen.getByRole('tabpanel').textContent?.trim()).toBe('')
		})

		it('без слотов панели нет роли tabpanel и aria-controls', () => {
			const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })
			expect(container.querySelector('[role="tabpanel"]')).toBeNull()
			expect(screen.getByRole('tab', { name: 'Информация' })).not.toHaveAttribute('aria-controls')
		})
	})
})

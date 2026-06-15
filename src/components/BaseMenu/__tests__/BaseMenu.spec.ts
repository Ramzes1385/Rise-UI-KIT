/**
 * Unit-тесты для BaseMenu.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import type { BaseMenuItem } from '../model/BaseMenu.types'
import BaseMenu from '../ui/BaseMenu.vue'

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Профиль', icon: '👤' },
		{ label: 'Настройки', icon: '⚙️' },
	],
	[{ label: 'Выход', icon: '🚪', isDisabled: true }],
]

describe('BaseMenu unit', () => {
	describe('рендер', () => {
		it('должен рендерить меню', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-menu')).toBeInTheDocument()
		})

		it('должен рендерить все элементы меню', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const menuItems = container.querySelectorAll('.base-menu__item')
			expect(menuItems).toHaveLength(3)
		})

		it('должен рендерить текст каждого элемента', () => {
			render(BaseMenu, {
				props: { items: ITEMS },
			})

			expect(screen.getByText('Профиль')).toBeInTheDocument()
			expect(screen.getByText('Настройки')).toBeInTheDocument()
			expect(screen.getByText('Выход')).toBeInTheDocument()
		})
	})

	describe('иконки', () => {
		it('должен рендерить иконку когда передана', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const icons = container.querySelectorAll('.base-menu__icon')
			expect(icons).toHaveLength(3)
		})

		it('не должен рендерить иконку когда не передана', () => {
			const items: BaseMenuItem[][] = [[{ label: 'Без иконки' }]]

			const { container } = render(BaseMenu, {
				props: { items },
			})

			expect(container.querySelector('.base-menu__icon')).not.toBeInTheDocument()
		})
	})

	describe('отключённый элемент', () => {
		it('должен добавлять класс --disabled на отключённый элемент', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const disabledItems = container.querySelectorAll('.base-menu__item--disabled')
			expect(disabledItems).toHaveLength(1)
		})
	})

	describe('разделители', () => {
		it('должен рендерить разделитель между группами', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const dividers = container.querySelectorAll('.base-menu__divider')
			expect(dividers).toHaveLength(1)
		})

		it('не должен рендерить разделитель для одной группы', () => {
			const items: BaseMenuItem[][] = [[{ label: 'Один' }]]
			const { container } = render(BaseMenu, {
				props: { items },
			})

			expect(container.querySelector('.base-menu__divider')).not.toBeInTheDocument()
		})
	})

	describe('emit select', () => {
		it('должен эмитить select при клике на элемент', async () => {
			const onSelect = vi.fn()
			const { container } = render(BaseMenu, {
				props: { items: ITEMS, onSelect },
			})

			const item = container.querySelector('.base-menu__item:not(.base-menu__item--disabled)') as HTMLElement
			await fireEvent.click(item)

			expect(onSelect).toHaveBeenCalledTimes(1)
			expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Профиль' }))
		})

		it('не должен эмитить select при клике на отключённый элемент', async () => {
			const onSelect = vi.fn()
			const { container } = render(BaseMenu, {
				props: { items: ITEMS, onSelect },
			})

			const disabledItem = container.querySelector('.base-menu__item--disabled') as HTMLElement
			await fireEvent.click(disabledItem)

			expect(onSelect).not.toHaveBeenCalled()
		})

		it('должен вызывать item.click при клике на элемент с callback', async () => {
			const clickFn = vi.fn()
			const items: BaseMenuItem[][] = [[{ label: 'С кликом', click: clickFn }]]
			const onSelect = vi.fn()
			const { container } = render(BaseMenu, {
				props: { items, onSelect },
			})

			const item = container.querySelector('.base-menu__item') as HTMLElement
			await fireEvent.click(item)

			expect(clickFn).toHaveBeenCalledTimes(1)
			expect(onSelect).toHaveBeenCalledTimes(1)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS, sizeScale: 100 },
			})

			const el = container.querySelector('.base-menu') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS, sizeScale: 150 },
			})

			const el = container.querySelector('.base-menu') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс variant', () => {
		it('должен добавлять класс варианта --outline', () => {
			const { container } = render(BaseMenu, {
				props: { items: ITEMS, variant: 'outline' },
			})

			expect(container.querySelector('.base-menu')?.classList.contains('base-menu--outline')).toBe(true)
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseMenu, {
				props: {
					items: ITEMS,
					customClass: 'custom-menu-class',
				},
			})

			expect(container.querySelector('.base-menu')?.classList.contains('custom-menu-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseMenu, {
				props: {
					items: ITEMS,
					customClass: {
						root: 'custom-menu-root',
						group: 'custom-menu-group',
						item: 'custom-menu-item',
						icon: 'custom-menu-icon',
						label: 'custom-menu-label',
						divider: 'custom-menu-divider',
					},
				},
			})

			expect(container.querySelector('.base-menu')?.classList.contains('custom-menu-root')).toBe(true)
			expect(container.querySelector('.base-menu__group')?.classList.contains('custom-menu-group')).toBe(true)
			expect(container.querySelector('.base-menu__item')?.classList.contains('custom-menu-item')).toBe(true)
			expect(container.querySelector('.base-menu__icon')?.classList.contains('custom-menu-icon')).toBe(true)
			expect(container.querySelector('.base-menu__label')?.classList.contains('custom-menu-label')).toBe(true)
			expect(container.querySelector('.base-menu__divider')?.classList.contains('custom-menu-divider')).toBe(true)
		})
	})
})

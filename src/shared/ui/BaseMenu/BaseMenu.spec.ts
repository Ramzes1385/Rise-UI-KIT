/**
 * Unit-тесты для BaseMenu.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BaseMenuItem } from './BaseMenu.types'
import BaseMenu from './BaseMenu.vue'

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
})

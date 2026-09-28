/**
 * Integration-тесты для BaseMenu.
 * Проверяют взаимодействие: клики, emit select.
 */

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseMenu from '../ui/BaseMenu.vue'
import type { BaseMenuItem } from '../model/BaseMenu.types'

const clickHandler = vi.fn()

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Профиль', to: '/profile' },
		{ label: 'Действие', click: clickHandler },
	],
	[{ label: 'Выход', isDisabled: true }],
]

describe('BaseMenu integration', () => {
	beforeEach(() => {
		clickHandler.mockClear()
	})

	describe('клик по элементу', () => {
		it('должен вызывать click-обработчик при клике', async () => {
			const user = userEvent.setup()

			render(BaseMenu, {
				props: { items: ITEMS },
			})

			await user.click(screen.getByText('Действие'))

			expect(clickHandler).toHaveBeenCalled()
		})

		it('должен эмитить select при клике на элемент', async () => {
			const user = userEvent.setup()

			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			await user.click(screen.getByText('Профиль'))

			expect(emitted()).toHaveProperty('select')
			const selectEvent = emitted().select as BaseMenuItem[][]
			expect(selectEvent[0][0].label).toBe('Профиль')
			expect(selectEvent[0][0].to).toBe('/profile')
		})

		it('должен эмитить select при клике на элемент с click', async () => {
			const user = userEvent.setup()

			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			await user.click(screen.getByText('Действие'))

			expect(emitted()).toHaveProperty('select')
		})
	})

	describe('клавиатура и семантика', () => {
		it('пункты доступны вспомогательным технологиям как кнопки с именем', () => {
			render(BaseMenu, {
				props: { items: ITEMS },
			})

			expect(screen.getByRole('button', { name: 'Профиль' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Действие' })).toBeInTheDocument()
		})

		it('должен активировать пункт по Enter', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			await user.tab()
			await user.keyboard('{Enter}')

			expect(emitted().select).toEqual([[ITEMS[0][0]]])
		})

		it('должен активировать пункт по Space и вызывать item.click', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const item = screen.getByText('Действие').closest('.base-menu__item') as HTMLElement
			item.focus()
			await user.keyboard(' ')

			expect(clickHandler).toHaveBeenCalledTimes(1)
			expect(emitted().select).toEqual([[ITEMS[0][1]]])
		})

		it('отключённый пункт помечен aria-disabled и не активируется с клавиатуры', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			const disabledItem = screen.getByRole('button', { name: 'Выход' })
			expect(disabledItem).toHaveAttribute('aria-disabled', 'true')

			disabledItem.focus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')

			expect(emitted()).not.toHaveProperty('select')
		})
	})

	describe('отключённый элемент', () => {
		it('не должен эмитить select при клике на отключённый', async () => {
			const { emitted } = render(BaseMenu, {
				props: { items: ITEMS },
			})

			await fireEvent.click(screen.getByText('Выход'))

			expect(emitted()).not.toHaveProperty('select')
			expect(clickHandler).not.toHaveBeenCalled()
		})
	})
})

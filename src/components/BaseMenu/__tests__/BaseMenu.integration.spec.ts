/**
 * Integration-тесты для BaseMenu.
 * Проверяют взаимодействие: клики, emit select.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { vi } from 'vitest'

import type { BaseMenuItem } from '../model/BaseMenu.types'
import BaseMenu from '../ui/BaseMenu.vue'

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

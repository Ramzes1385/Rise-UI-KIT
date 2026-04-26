/**
 * Integration-тесты для BaseSlideover.
 * Проверяют взаимодействие: закрытие, оверлей.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseSlideover from './BaseSlideover.vue'

describe('BaseSlideover integration', () => {
	describe('закрытие по кнопке', () => {
		it('должен эмитить update:isOpen=false при клике на ×', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, title: 'Панель' },
			})

			const closeBtn = screen.getByRole('button', { name: 'Закрыть' })
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('update:isOpen')
			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(false)
		})

		it('должен эмитить close при клике на ×', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, title: 'Панель' },
			})

			const closeBtn = screen.getByRole('button', { name: 'Закрыть' })
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('закрытие по оверлею', () => {
		it('должен закрыть при клике на оверлей когда closeOnOverlay=true', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnOverlay: true },
			})

			const overlay = document.querySelector('.base-slideover') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).toHaveProperty('close')
		})

		it('не должен закрывать при клике на оверлей когда closeOnOverlay=false', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnOverlay: false },
			})

			const overlay = document.querySelector('.base-slideover') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).not.toHaveProperty('close')
		})
	})
})

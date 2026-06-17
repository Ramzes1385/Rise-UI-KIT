/**
 * Integration-тесты для BaseSlideover.
 * Проверяют взаимодействие: закрытие, оверлей.
 * Компонент использует teleport — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseSlideover from '../ui/BaseSlideover.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))

describe('BaseSlideover integration', () => {
	describe('закрытие по кнопке', () => {
		it('должен эмитить update:isOpen=false при клике на Г—', async () => {
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

		it('должен эмитить close при клике на Г—', async () => {
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

	describe('contained-режим', () => {
		it('должен закрываться по кнопке когда isContained=true', async () => {
			const user = userEvent.setup()

			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, title: 'Внутри', isContained: true },
			})

			const closeBtn = screen.getByRole('button', { name: 'Закрыть' })
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('close')
		})

		it('должен закрываться по оверлею когда isContained=true', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, isContained: true, closeOnOverlay: true },
			})

			const overlay = document.querySelector('.base-slideover') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('закрытие по Escape', () => {
		it('должен закрываться при нажатии Escape когда closeOnEscape=true', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnEscape: true },
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).toHaveProperty('close')
		})

		it('не должен закрываться при нажатии Escape когда closeOnEscape=false', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnEscape: false },
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).not.toHaveProperty('close')
		})

		it('должен использовать дефолт true когда closeOnEscape=undefined', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnEscape: undefined },
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).toHaveProperty('close')
		})

		it('должен использовать дефолт true когда closeOnOverlay=undefined', async () => {
			const { emitted } = render(BaseSlideover, {
				props: { isOpen: true, closeOnOverlay: undefined },
			})

			const overlay = document.querySelector('.base-slideover') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('header без title', () => {
		it('должен рендерить header через слот без title', () => {
			render(BaseSlideover, {
				props: { isOpen: true },
				slots: { header: '<span class="custom-header">Кастомный</span>' },
			})

			expect(document.querySelector('.custom-header')).toBeInTheDocument()
			expect(document.querySelector('.base-slideover__title')).not.toBeInTheDocument()
		})

		it('должен рендерить дефолтный заголовок когда title задан без слота', () => {
			render(BaseSlideover, {
				props: { isOpen: true, title: 'Заголовок' },
			})

			expect(document.querySelector('.base-slideover__title')?.textContent).toBe('Заголовок')
		})

		it('не должен рендерить BaseText когда title пустой и нет header-слота', () => {
			render(BaseSlideover, {
				props: { isOpen: true, title: '' },
			})

			expect(document.querySelector('.base-slideover__title')).not.toBeInTheDocument()
		})
	})
})

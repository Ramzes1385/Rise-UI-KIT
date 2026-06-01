/**
 * Integration-тесты для BaseModal.
 * Проверяют взаимодействие: закрытие, оверлей, contained-режим.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render } from '@testing-library/vue'

import BaseModal from './BaseModal.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))

describe('BaseModal integration', () => {
	describe('закрытие по кнопке', () => {
		it('должен эмитить update:isOpen=false при клике на кнопку закрытия', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseModal, {
				props: { isOpen: true, title: 'Модал' },
			})

			const closeBtn = document.querySelector('.base-modal__close') as HTMLElement
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('update:isOpen')
			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(false)
		})

		it('должен эмитить close при клике на кнопку закрытия', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseModal, {
				props: { isOpen: true, title: 'Модал' },
			})

			const closeBtn = document.querySelector('.base-modal__close') as HTMLElement
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('закрытие по оверлею', () => {
		it('должен закрыть модал при клике на оверлей когда closeOnOverlay=true', async () => {
			const { emitted } = render(BaseModal, {
				props: { isOpen: true, closeOnOverlay: true },
			})

			const overlay = document.querySelector('.base-modal') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).toHaveProperty('close')
		})

		it('не должен закрывать модал при клике на оверлей когда closeOnOverlay=false', async () => {
			const { emitted } = render(BaseModal, {
				props: { isOpen: true, closeOnOverlay: false },
			})

			const overlay = document.querySelector('.base-modal') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).not.toHaveProperty('close')
		})
	})

	describe('contained-режим', () => {
		it('должен закрываться по кнопке когда isContained=true', async () => {
			const user = userEvent.setup()

			const { emitted } = render(BaseModal, {
				props: { isOpen: true, title: 'Внутри', isContained: true },
			})

			const closeBtn = document.querySelector('.base-modal__close') as HTMLElement
			await user.click(closeBtn)

			expect(emitted()).toHaveProperty('close')
		})

		it('должен закрываться по оверлею когда isContained=true', async () => {
			const { emitted } = render(BaseModal, {
				props: { isOpen: true, isContained: true, closeOnOverlay: true },
			})

			const overlay = document.querySelector('.base-modal') as HTMLElement
			await fireEvent.click(overlay)

			expect(emitted()).toHaveProperty('close')
		})
	})
})


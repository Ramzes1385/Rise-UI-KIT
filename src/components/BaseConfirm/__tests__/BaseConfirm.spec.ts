/**
 * Unit-тесты BaseConfirm: семантика alertdialog, подписи, порядок событий, опасное действие.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { BaseModal } from '@components/BaseModal'
import BaseConfirm from '../ui/BaseConfirm.vue'

const TITLE = 'Удалить проект?'
const DESCRIPTION = 'Задачи и файлы проекта удалятся без возможности восстановления.'

describe('BaseConfirm', () => {
	describe('доступность', () => {
		it('окно — alertdialog: вопрос в имени, последствия в описании', () => {
			render(BaseConfirm, { props: { isOpen: true, title: TITLE, description: DESCRIPTION } })

			const dialog = screen.getByRole('alertdialog', { name: TITLE })
			expect(dialog).toHaveAttribute('aria-modal', 'true')
			expect(dialog).toHaveAccessibleDescription(DESCRIPTION)
		})

		it('без пояснения окно не ссылается на описание', () => {
			render(BaseConfirm, { props: { isOpen: true, title: 'Выйти из аккаунта?' } })

			expect(screen.getByRole('alertdialog', { name: 'Выйти из аккаунта?' })).not.toHaveAttribute('aria-describedby')
			expect(document.querySelector('.base-confirm__description')).not.toBeInTheDocument()
		})

		it('закрытое окно не рендерится', () => {
			render(BaseConfirm, { props: { isOpen: false, title: TITLE } })

			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		})

		it('обычное действие: фокус на подтверждении', async () => {
			render(BaseConfirm, { props: { isOpen: true, title: 'Опубликовать статью?' } })

			await waitFor(() => expect(screen.getByRole('button', { name: 'Подтвердить' })).toHaveFocus())
			expect(screen.getByRole('button', { name: 'Отмена' })).not.toHaveAttribute('autofocus')
		})

		it('опасное действие: фокус на «Отмене», кнопка подтверждения цвета ошибки', async () => {
			render(BaseConfirm, { props: { isOpen: true, title: TITLE, isDanger: true, confirmLabel: 'Удалить' } })

			await waitFor(() => expect(screen.getByRole('button', { name: 'Отмена' })).toHaveFocus())
			const confirm = screen.getByRole('button', { name: 'Удалить' })
			expect(confirm.style.getPropertyValue('--custom-bg')).toBe('var(--rise-error)')
			expect(confirm.style.getPropertyValue('--custom-text')).toBe('var(--rise-on-error)')
		})
	})

	describe('подписи и оформление', () => {
		it('подписи кнопок по умолчанию и свои', async () => {
			const { rerender } = render(BaseConfirm, { props: { isOpen: true, title: TITLE } })

			expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument()

			await rerender({ confirmLabel: 'Удалить', cancelLabel: 'Оставить' })
			expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Оставить' })).toBeInTheDocument()
		})

		it('color красит окно', () => {
			render(BaseConfirm, { props: { isOpen: true, title: TITLE, color: { bg: { base: 'var(--rise-warning-soft)' } } } })

			expect((document.querySelector('.base-modal') as HTMLElement).style.getPropertyValue('--custom-bg')).toBe('var(--rise-warning-soft)')
		})

		it('customClass распределяется по элементам, variant передаётся окну', () => {
			render(BaseConfirm, {
				props: {
					isOpen: true,
					title: TITLE,
					description: DESCRIPTION,
					variant: 'shadow',
					customClass: { root: 'my-root', description: 'my-description', cancel: 'my-cancel', confirm: 'my-confirm' },
				},
			})

			expect(document.querySelector('.base-modal')).toHaveClass('my-root', 'base-modal--shadow')
			expect(document.querySelector('.base-modal__content')).toHaveClass('base-confirm')
			expect(screen.getByText(DESCRIPTION)).toHaveClass('base-confirm__description', 'my-description')
			expect(screen.getByRole('button', { name: 'Отмена' })).toHaveClass('my-cancel')
			expect(screen.getByRole('button', { name: 'Подтвердить' })).toHaveClass('my-confirm')
		})
	})

	describe('результат', () => {
		/** Рендерит окно и записывает порядок событий */
		function renderWithLog() {
			const log: string[] = []
			const utils = render(BaseConfirm, {
				props: {
					isOpen: true,
					title: TITLE,
					onClose: (result: boolean) => log.push(`close:${result}`),
					'onUpdate:isOpen': (value: boolean) => log.push(`update:isOpen:${value}`),
					onConfirm: () => log.push('confirm'),
					onCancel: () => log.push('cancel'),
				},
			})
			return { ...utils, log }
		}

		it('подтверждение: сначала close(true), затем update:isOpen и confirm', async () => {
			const { log } = renderWithLog()

			await fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))

			expect(log).toEqual(['close:true', 'update:isOpen:false', 'confirm'])
		})

		it('«Отмена» закрывает с результатом false', async () => {
			const { log } = renderWithLog()

			await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

			expect(log).toEqual(['close:false', 'update:isOpen:false', 'cancel'])
		})

		it.each([
			['Escape', () => fireEvent.keyDown(document, { key: 'Escape' })],
			['крестик', () => fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))],
			['клик по фону', () => fireEvent.click(document.querySelector('.base-modal') as HTMLElement)],
		])('%s — отмена', async (_, close) => {
			const { log } = renderWithLog()

			await close()

			expect(log).toEqual(['close:false', 'update:isOpen:false', 'cancel'])
		})

		it('закрытое окно не отвечает второй раз (повторный клик во время анимации закрытия)', async () => {
			const wrapper = mount(BaseConfirm, { props: { isOpen: false, title: TITLE } })

			wrapper.findComponent(BaseModal).vm.$emit('close')

			expect(wrapper.emitted()).not.toHaveProperty('close')
			expect(wrapper.emitted()).not.toHaveProperty('cancel')
			wrapper.unmount()
		})

		it('после анимации закрытия сообщает after-leave', () => {
			const wrapper = mount(BaseConfirm, { props: { isOpen: true, title: TITLE } })

			wrapper.findComponent(BaseModal).vm.$emit('after-leave')

			expect(wrapper.emitted('after-leave')).toHaveLength(1)
			wrapper.unmount()
		})
	})
})

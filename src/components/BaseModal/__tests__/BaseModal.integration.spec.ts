import '@testing-library/jest-dom/vitest'
import BaseModal from '../ui/BaseModal.vue'
import userEvent from '@testing-library/user-event'
import { defineComponent, nextTick, ref } from 'vue'
import { BaseSlideover } from '@components/BaseSlideover'
import { useImageZoom } from '@composables/image/useImageZoom'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

function renderModalHost(modalProps: Record<string, unknown> = {}) {
	const Host = defineComponent({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { isOpen, modalProps }
		},
		template: `
			<div>
				<button type="button" @click="isOpen = true">Открыть</button>
				<BaseModal v-model:is-open="isOpen" title="Подтверждение" v-bind="modalProps">
					<input aria-label="Комментарий" />
					<template #footer>
						<button type="button">Отмена</button>
						<button type="button">Сохранить</button>
					</template>
				</BaseModal>
			</div>
		`,
	})
	return render(Host)
}

describe('BaseModal integration', () => {
	beforeEach(() => {
		document.body.style.overflow = ''
		document.body.style.paddingRight = ''
	})

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

	describe('блокировка прокрутки', () => {
		it('держит блокировку, пока открыт slideover, даже если модалка закрыта первой', async () => {
			const user = userEvent.setup()
			const Host = defineComponent({
				components: { BaseModal, BaseSlideover },
				setup() {
					const isModalOpen = ref(true)
					const isSlideoverOpen = ref(true)
					return { isModalOpen, isSlideoverOpen }
				},
				template: `
					<div>
						<button @click="isModalOpen = false">Закрыть модалку</button>
						<button @click="isSlideoverOpen = false">Закрыть панель</button>
						<BaseModal v-model:is-open="isModalOpen" title="Модалка" />
						<BaseSlideover v-model:is-open="isSlideoverOpen" title="Панель" />
					</div>
				`,
			})
			render(Host)
			expect(document.body.style.overflow).toBe('hidden')

			await user.click(screen.getByText('Закрыть модалку'))
			expect(document.body.style.overflow).toBe('hidden')

			await user.click(screen.getByText('Закрыть панель'))
			expect(document.body.style.overflow).toBe('')
		})

		it('закрытие зума изображения внутри модалки не снимает её блокировку', async () => {
			const user = userEvent.setup()
			const Host = defineComponent({
				components: { BaseModal },
				setup() {
					const isModalOpen = ref(true)
					const zoom = useImageZoom({
						initialScale: () => 1,
						zoomStep: () => 0.25,
						minScale: () => 0.5,
						maxScale: () => 5,
						closeOnOverlay: () => true,
					})
					return { isModalOpen, zoom }
				},
				template: `
					<BaseModal v-model:is-open="isModalOpen" title="Галерея">
						<button @click="zoom.openZoom()">Открыть зум</button>
						<button @click="zoom.closeZoom()">Закрыть зум</button>
					</BaseModal>
				`,
			})
			render(Host)
			expect(document.body.style.overflow).toBe('hidden')

			await user.click(screen.getByText('Открыть зум'))
			await user.click(screen.getByText('Закрыть зум'))

			expect(document.body.style.overflow).toBe('hidden')

			await user.click(document.querySelector('.base-modal__close') as HTMLElement)
			expect(document.body.style.overflow).toBe('')
		})
	})

	describe('семантика диалога и управление фокусом', () => {
		it('открытая модалка — диалог с aria-modal и именем из заголовка', () => {
			render(BaseModal, { props: { isOpen: true, title: 'Подтверждение' } })

			const dialog = screen.getByRole('dialog', { name: 'Подтверждение' })
			expect(dialog).toHaveAttribute('aria-modal', 'true')
			expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()
		})

		it('при открытии переводит фокус внутрь, по Escape возвращает его на триггер', async () => {
			const user = userEvent.setup()
			renderModalHost()
			const trigger = screen.getByRole('button', { name: 'Открыть' })

			await user.click(trigger)
			const dialog = screen.getByRole('dialog', { name: 'Подтверждение' })
			await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

			await user.keyboard('{Escape}')

			expect(trigger).toHaveFocus()
		})

		it('Tab и Shift+Tab циклически перемещают фокус внутри диалога', async () => {
			const user = userEvent.setup()
			renderModalHost()

			await user.click(screen.getByRole('button', { name: 'Открыть' }))
			const closeButton = screen.getByRole('button', { name: 'Закрыть' })
			await waitFor(() => expect(closeButton).toHaveFocus())

			await user.tab()
			expect(screen.getByRole('textbox', { name: 'Комментарий' })).toHaveFocus()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Отмена' })).toHaveFocus()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Сохранить' })).toHaveFocus()

			await user.tab()
			expect(closeButton).toHaveFocus()

			await user.tab({ shift: true })
			expect(screen.getByRole('button', { name: 'Сохранить' })).toHaveFocus()
		})

		it('hasOverlay=false остаётся модальным: оверлей по-прежнему перехватывает клики', async () => {
			const user = userEvent.setup()
			renderModalHost({ hasOverlay: false })

			await user.click(screen.getByRole('button', { name: 'Открыть' }))

			expect(screen.getByRole('dialog', { name: 'Подтверждение' })).toHaveAttribute('aria-modal', 'true')
			await waitFor(() => expect(screen.getByRole('button', { name: 'Закрыть' })).toHaveFocus())
		})

		it('тело с прокруткой получает tabindex="0": без полей и кнопок его можно прокрутить с клавиатуры', async () => {
			vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900)
			vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
			render(BaseModal, { props: { isOpen: true, title: 'Условия' }, slots: { default: '<p>Длинный текст</p>' } })
			await nextTick()

			expect(document.querySelector('.base-modal__body')).toHaveAttribute('tabindex', '0')
		})

		it('тело без прокрутки не добавляет остановку Tab', async () => {
			render(BaseModal, { props: { isOpen: true, title: 'Условия' }, slots: { default: '<p>Короткий текст</p>' } })
			await nextTick()

			expect(document.querySelector('.base-modal__body')).not.toHaveAttribute('tabindex')
		})

		it('isContained — немодальный диалог: без aria-modal и без перехвата фокуса', async () => {
			render(BaseModal, { props: { isOpen: true, title: 'Внутри блока', isContained: true } })
			await nextTick()

			const dialog = screen.getByRole('dialog', { name: 'Внутри блока' })
			expect(dialog).not.toHaveAttribute('aria-modal')
			expect(dialog).not.toContainElement(document.activeElement as HTMLElement)
		})
	})
})

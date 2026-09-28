/** Composables (usePopup, useEscapeKey, useScrollLock) реальные — проверяется их связка; компонент использует teleport — поиск в document. */

import '@testing-library/jest-dom/vitest'
import BaseSlideover from '../ui/BaseSlideover.vue'
import userEvent from '@testing-library/user-event'
import { defineComponent, nextTick, ref } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

/** Хост: кнопка-триггер и панель с полем ввода и кнопкой в футере */
function renderSlideoverHost() {
	const Host = defineComponent({
		components: { BaseSlideover },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<button type="button" @click="isOpen = true">Фильтры</button>
				<BaseSlideover v-model:is-open="isOpen" title="Настройки фильтра">
					<input aria-label="Название" />
					<template #footer>
						<button type="button">Применить</button>
					</template>
				</BaseSlideover>
			</div>
		`,
	})
	return render(Host)
}

describe('BaseSlideover integration', () => {
	beforeEach(() => {
		document.body.style.overflow = ''
		document.body.style.paddingRight = ''
	})

	describe('закрытие по кнопке', () => {
		it('должен эмитить update:isOpen=false при клике на «Закрыть»', async () => {
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

		it('должен эмитить close при клике на «Закрыть»', async () => {
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

	describe('семантика диалога и управление фокусом', () => {
		it('открытая панель — диалог с aria-modal и именем из заголовка', () => {
			render(BaseSlideover, { props: { isOpen: true, title: 'Настройки фильтра' } })

			expect(screen.getByRole('dialog', { name: 'Настройки фильтра' })).toHaveAttribute('aria-modal', 'true')
		})

		it('при открытии переводит фокус внутрь, по Escape возвращает его на триггер', async () => {
			const user = userEvent.setup()
			renderSlideoverHost()
			const trigger = screen.getByRole('button', { name: 'Фильтры' })

			await user.click(trigger)
			const dialog = screen.getByRole('dialog', { name: 'Настройки фильтра' })
			await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

			await user.keyboard('{Escape}')

			expect(trigger).toHaveFocus()
		})

		it('Tab и Shift+Tab циклически перемещают фокус внутри панели', async () => {
			const user = userEvent.setup()
			renderSlideoverHost()

			await user.click(screen.getByRole('button', { name: 'Фильтры' }))
			const closeButton = screen.getByRole('button', { name: 'Закрыть' })
			await waitFor(() => expect(closeButton).toHaveFocus())

			await user.tab()
			expect(screen.getByRole('textbox', { name: 'Название' })).toHaveFocus()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Применить' })).toHaveFocus()

			await user.tab()
			expect(closeButton).toHaveFocus()

			await user.tab({ shift: true })
			expect(screen.getByRole('button', { name: 'Применить' })).toHaveFocus()
		})

		it('isContained — немодальная панель: без aria-modal и без перехвата фокуса', async () => {
			render(BaseSlideover, { props: { isOpen: true, title: 'Внутри блока', isContained: true } })
			await nextTick()

			const dialog = screen.getByRole('dialog', { name: 'Внутри блока' })
			expect(dialog).not.toHaveAttribute('aria-modal')
			expect(dialog).not.toContainElement(document.activeElement as HTMLElement)
		})

		it('со слотом header не ссылается aria-labelledby на отсутствующий заголовок', () => {
			render(BaseSlideover, {
				props: { isOpen: true, title: 'Скрытый заголовок' },
				slots: { header: '<span>Кастомная шапка</span>' },
			})

			expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
		})

		it('тело с прокруткой получает tabindex="0", короткое — нет', async () => {
			const { unmount } = render(BaseSlideover, { props: { isOpen: true, title: 'Короткая' } })
			await nextTick()
			expect(document.querySelector('.base-slideover__body')).not.toHaveAttribute('tabindex')
			unmount()

			// jsdom не считает раскладку: содержимое выше тела задаётся подменой размеров
			vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900)
			vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
			render(BaseSlideover, { props: { isOpen: true, title: 'Длинная' } })
			await nextTick()
			expect(document.querySelector('.base-slideover__body')).toHaveAttribute('tabindex', '0')
		})
	})
})

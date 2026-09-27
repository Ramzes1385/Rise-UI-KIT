/**
 * Integration-тесты для BaseForm.
 * Проверяют взаимодействие: отправка формы.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseForm from '../ui/BaseForm.vue'

describe('BaseForm integration', () => {
	describe('отправка формы', () => {
		it('должен эмитить submit при отправке формы', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseForm, {
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			await user.click(screen.getByText('Отправить'))

			expect(emitted()).toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isLoading=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isLoading: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			/** pointer-events: none блокирует userEvent, используем fireEvent */
			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isDisabled=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isDisabled: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})
	})

	describe('блокировка полей', () => {
		const FIELDS = '<input aria-label="Имя" /><button type="submit">Отправить</button>'

		it('isDisabled должен отключать поля формы, в том числе для клавиатуры', async () => {
			const user = userEvent.setup()
			render(BaseForm, {
				props: { isDisabled: true },
				slots: { default: FIELDS },
			})

			const input = screen.getByRole('textbox', { name: 'Имя' })
			expect(input).toBeDisabled()
			expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()

			await user.tab()
			expect(input).not.toHaveFocus()
		})

		it('isLoading должен отключать поля и помечать форму как занятую', () => {
			const { container } = render(BaseForm, {
				props: { isLoading: true },
				slots: { default: FIELDS },
			})

			expect(screen.getByRole('textbox', { name: 'Имя' })).toBeDisabled()
			expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'true')
		})

		/** Кнопка вне формы — для сценариев, где фокус находится или уходит за пределы формы */
		function createOutsideButton(): HTMLButtonElement {
			const button = document.createElement('button')
			button.dataset.outside = ''
			document.body.append(button)
			return button
		}

		/**
		 * Эмулирует focus fixup браузера: фокус с поля, ставшего disabled, уходит на body.
		 * jsdom этого не делает, а blur() у уже отключённого поля игнорирует — переводим фокус через временную кнопку.
		 */
		function emulateFocusFixup(): void {
			const probe = createOutsideButton()
			probe.focus()
			probe.blur()
			probe.remove()
		}

		afterEach(() => {
			document.querySelectorAll('[data-outside]').forEach(element => element.remove())
		})

		it('после снятия isLoading поля снова доступны, а потерянный фокус возвращается на поле', async () => {
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			const input = screen.getByRole('textbox', { name: 'Имя' })
			input.focus()

			await rerender({ isLoading: true })
			emulateFocusFixup()
			expect(document.body).toHaveFocus()
			await rerender({ isLoading: false })

			expect(input).toBeEnabled()
			expect(input).toHaveFocus()
		})

		it('не должен перехватывать фокус, если за время блокировки его перевели на другой элемент', async () => {
			const outside = createOutsideButton()
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			screen.getByRole('textbox', { name: 'Имя' }).focus()

			await rerender({ isLoading: true })
			emulateFocusFixup()
			outside.focus()
			await rerender({ isLoading: false })

			expect(outside).toHaveFocus()
		})

		it('не должен переводить фокус после разблокировки, если при блокировке фокус был вне формы', async () => {
			const outside = createOutsideButton()
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			outside.focus()

			await rerender({ isLoading: true })
			outside.blur()
			await rerender({ isLoading: false })

			expect(document.body).toHaveFocus()
			expect(screen.getByRole('textbox', { name: 'Имя' })).not.toHaveFocus()
		})
	})
})

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseButton from '../ui/BaseButton.vue'

describe('BaseButton integration', () => {
	describe('клик', () => {
		it('должен эмитить click при клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, { slots: { default: 'Кнопка' } })

			await user.click(screen.getByRole('button'))

			expect(emitted()).toHaveProperty('click')
		})

		it('не должен эмитить click когда isDisabled=true', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			await user.click(screen.getByRole('button'))

			expect(emitted()).not.toHaveProperty('click')
		})

		it('не должен эмитить click когда isLoading=true', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Кнопка' },
			})

			await user.click(screen.getByRole('button'))

			expect(emitted()).not.toHaveProperty('click')
		})

		// Кнопка в loading остаётся без нативного disabled (чтобы не терять фокус),
		// но клик по ней, как и раньше, не должен доходить до кликабельного предка (строка таблицы, карточка)
		it.each([
			{ isLoading: true, reaches: 'нет', expectedParentClicks: 0 },
			{ isLoading: false, reaches: 'да', expectedParentClicks: 1 },
		])('клик и Enter доходят до обработчика предка при isLoading=$isLoading: $reaches', async ({ isLoading, expectedParentClicks }) => {
			const user = userEvent.setup()
			const onParentClick = vi.fn()
			const parent = document.createElement('div')
			parent.addEventListener('click', onParentClick)
			document.body.appendChild(parent)

			render(BaseButton, {
				props: { isLoading },
				slots: { default: 'Кнопка' },
				container: parent,
			})

			await user.click(screen.getByRole('button', { name: 'Кнопка' }))
			screen.getByRole('button', { name: 'Кнопка' }).focus()
			await user.keyboard('{Enter}')

			expect(onParentClick).toHaveBeenCalledTimes(expectedParentClicks * 2)
			parent.remove()
		})
	})

	describe('фокус', () => {
		it('должен получать фокус по Tab', async () => {
			const user = userEvent.setup()
			render(BaseButton, { slots: { default: 'Кнопка' } })

			await user.tab()

			expect(screen.getByRole('button')).toHaveFocus()
		})

		it('не должен получать фокус когда isDisabled=true', async () => {
			const user = userEvent.setup()
			render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			await user.tab()

			expect(screen.getByRole('button')).not.toHaveFocus()
		})

		it('должен оставаться в порядке табуляции во время загрузки и не активироваться клавиатурой', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Сохранить' },
			})

			await user.tab()
			const button = screen.getByRole('button', { name: 'Сохранить' })
			expect(button).toHaveFocus()

			await user.keyboard('{Enter}')
			await user.keyboard(' ')

			expect(emitted()).not.toHaveProperty('click')
		})

		it('должен сохранять фокус при переходе в состояние загрузки', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseButton, { slots: { default: 'Сохранить' } })

			await user.tab()
			await rerender({ isLoading: true })

			const button = screen.getByRole('button', { name: 'Сохранить' })
			expect(button).toHaveFocus()
			expect(button).toHaveAttribute('aria-busy', 'true')
		})
	})

	describe('в форме', () => {
		it('должен отправлять форму кнопкой type=submit без загрузки', async () => {
			const user = userEvent.setup()
			const onSubmit = vi.fn((event: Event) => event.preventDefault())
			const form = document.createElement('form')
			form.addEventListener('submit', onSubmit)
			document.body.appendChild(form)

			render(BaseButton, {
				props: { type: 'submit' },
				slots: { default: 'Отправить' },
				container: form,
			})

			await user.click(screen.getByRole('button', { name: 'Отправить' }))

			expect(onSubmit).toHaveBeenCalledTimes(1)
			form.remove()
		})

		it('не должен отправлять форму кнопкой type=submit во время загрузки', async () => {
			const user = userEvent.setup()
			const onSubmit = vi.fn((event: Event) => event.preventDefault())
			const form = document.createElement('form')
			form.addEventListener('submit', onSubmit)
			document.body.appendChild(form)

			render(BaseButton, {
				props: { type: 'submit', isLoading: true },
				slots: { default: 'Отправить' },
				container: form,
			})

			await user.click(screen.getByRole('button', { name: 'Отправить' }))

			expect(onSubmit).not.toHaveBeenCalled()
			form.remove()
		})
	})
})

import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../ui/BaseButton.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

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

	describe('isFocusableWhenDisabled', () => {
		const renderFocusable = (props: Record<string, unknown> = {}, container?: HTMLElement) =>
			render(BaseButton, {
				props: { isDisabled: true, isFocusableWhenDisabled: true, ...props },
				slots: { default: 'Вперёд' },
				...(container ? { container } : {}),
			})

		it('отключённая кнопка — aria-disabled вместо disabled и остаётся в порядке Tab', async () => {
			const user = userEvent.setup()
			renderFocusable()
			const button = screen.getByRole('button', { name: 'Вперёд' })

			expect(button).not.toHaveAttribute('disabled')
			expect(button).toHaveAttribute('aria-disabled', 'true')
			expect(button).toHaveClass('base-button--disabled')
			expect(button.tabIndex).toBe(0)

			await user.tab()
			expect(button).toHaveFocus()
		})

		it('клик, Enter и Space не эмитят click', async () => {
			const user = userEvent.setup()
			const { emitted } = renderFocusable()
			const button = screen.getByRole('button', { name: 'Вперёд' })

			await user.click(button)
			button.focus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')

			expect(button).toHaveFocus()
			expect(emitted()).not.toHaveProperty('click')
		})

		it('клик не всплывает к предку', async () => {
			const user = userEvent.setup()
			const onParentClick = vi.fn()
			const parent = document.createElement('div')
			parent.addEventListener('click', onParentClick)
			document.body.appendChild(parent)
			renderFocusable({}, parent)

			await user.click(screen.getByRole('button', { name: 'Вперёд' }))

			expect(onParentClick).not.toHaveBeenCalled()
			parent.remove()
		})

		it('type=submit не отправляет форму ни кликом, ни Space', async () => {
			const user = userEvent.setup()
			const onSubmit = vi.fn((event: Event) => event.preventDefault())
			const form = document.createElement('form')
			form.addEventListener('submit', onSubmit)
			document.body.appendChild(form)
			renderFocusable({ type: 'submit' }, form)
			const button = screen.getByRole('button', { name: 'Вперёд' })

			await user.click(button)
			button.focus()
			await user.keyboard(' ')

			expect(onSubmit).not.toHaveBeenCalled()
			form.remove()
		})

		it('фокус остаётся на кнопке, когда она отключается от собственного нажатия', async () => {
			const user = userEvent.setup()
			const { rerender, emitted } = render(BaseButton, {
				props: { isFocusableWhenDisabled: true },
				slots: { default: 'Вперёд' },
			})
			const button = screen.getByRole('button', { name: 'Вперёд' })

			await user.tab()
			await user.keyboard('{Enter}')
			await rerender({ isFocusableWhenDisabled: true, isDisabled: true })

			expect(emitted('click')).toHaveLength(1)
			expect(button).toHaveFocus()
			expect(document.activeElement).toBe(button)
		})

		it('методы focus() и blur() через ref работают у отключённой кнопки', () => {
			const wrapper = mount(BaseButton, {
				props: { isDisabled: true, isFocusableWhenDisabled: true },
				slots: { default: 'Вперёд' },
				attachTo: document.body,
			})

			wrapper.vm.focus()
			expect(document.activeElement).toBe(wrapper.element)
			wrapper.vm.blur()
			expect(document.activeElement).not.toBe(wrapper.element)
			wrapper.unmount()
		})

		it('без isDisabled кнопка обычная: нет aria-disabled, клик эмитится', async () => {
			const user = userEvent.setup()
			const { emitted } = renderFocusable({ isDisabled: false })
			const button = screen.getByRole('button', { name: 'Вперёд' })

			expect(button).not.toHaveAttribute('aria-disabled')
			await user.click(button)

			expect(emitted('click')).toHaveLength(1)
		})

		it('без нового пропа отключённая кнопка — прежний нативный disabled', () => {
			render(BaseButton, { props: { isDisabled: true }, slots: { default: 'Вперёд' } })
			const button = screen.getByRole('button', { name: 'Вперёд' })

			expect(button).toBeDisabled()
			expect(button).not.toHaveAttribute('aria-disabled')
		})
	})
})

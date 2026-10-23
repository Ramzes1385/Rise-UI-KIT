import '@testing-library/jest-dom/vitest'
import BaseCard from '../ui/BaseCard.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseCard integration', () => {
	it('должен рендерить контент в слотах', () => {
		render(BaseCard, {
			slots: {
				header: 'Header Content',
				default: 'Body Content',
				footer: 'Footer Content',
			},
		})

		expect(screen.getByText('Header Content')).toBeInTheDocument()
		expect(screen.getByText('Body Content')).toBeInTheDocument()
		expect(screen.getByText('Footer Content')).toBeInTheDocument()
	})

	describe('клавиатура (fu-keyboard)', () => {
		it('с обработчиком — кнопка с именем из title, Enter и Space вызывают click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseCard, { props: { title: 'Тариф «Старт»', onClick }, slots: { default: 'Описание' } })

			const card = screen.getByRole('button', { name: 'Тариф «Старт»' })
			expect(card).toHaveClass('base-card--hoverable')
			await user.tab()
			expect(card).toHaveFocus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')
			expect(onClick).toHaveBeenCalledTimes(2)
			expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)
		})

		it('Enter в поле внутри карточки не вызывает click карточки', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseCard, { props: { onClick }, slots: { default: '<input aria-label="Поле" />' } })

			await user.click(screen.getByLabelText('Поле'))
			onClick.mockClear()
			await user.keyboard('{Enter}')
			expect(onClick).not.toHaveBeenCalled()
		})

		it('isHoverable без обработчика — только вид, без роли и фокуса', () => {
			const { container } = render(BaseCard, { props: { title: 'Карточка', isHoverable: true } })

			const card = container.querySelector('.base-card')
			expect(card).toHaveClass('base-card--hoverable')
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(card).not.toHaveAttribute('tabindex')
			expect(card).not.toHaveAttribute('aria-labelledby')
		})

		it('выключенная — aria-disabled, без фокуса; мышь, Enter и Space не вызывают click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseCard, { props: { title: 'Карточка', isDisabled: true, onClick } })

			const card = screen.getByRole('button', { name: 'Карточка' })
			expect(card).toHaveAttribute('aria-disabled', 'true')
			await user.tab()
			expect(card).not.toHaveFocus()
			await user.click(card)
			await fireEvent.keyDown(card, { key: 'Enter' })
			await fireEvent.keyDown(card, { key: ' ' })
			expect(onClick).not.toHaveBeenCalled()
		})

		it('без title — имя из содержимого, без aria-labelledby', () => {
			render(BaseCard, { props: { onClick: vi.fn() }, slots: { default: 'Открыть отчёт' } })

			expect(screen.getByRole('button', { name: 'Открыть отчёт' })).not.toHaveAttribute('aria-labelledby')
		})
	})
})

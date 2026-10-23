import '@testing-library/jest-dom/vitest'
import BaseBadge from '../ui/BaseBadge.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseBadge integration', () => {
	it('должен эмитить click при клике', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseBadge, {
			props: { label: 'Badge' },
		})

		await user.click(screen.getByText('Badge'))
		expect(emitted()).toHaveProperty('click')
	})

	describe('клавиатура (fu-keyboard)', () => {
		it('с обработчиком — кнопка в порядке Tab, Enter и Space вызывают click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseBadge, { props: { label: 'Новое', onClick } })

			const badge = screen.getByRole('button', { name: 'Новое' })
			await user.tab()
			expect(badge).toHaveFocus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')
			expect(onClick).toHaveBeenCalledTimes(2)
		})

		it('без обработчика — не кнопка и не в порядке Tab', () => {
			render(BaseBadge, { props: { label: 'Статус' } })

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(screen.getByText('Статус').closest('.base-badge')).not.toHaveAttribute('tabindex')
		})

		it('выключенный — aria-disabled, без фокуса; мышь, Enter и Space не вызывают click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseBadge, { props: { label: 'Новое', isDisabled: true, onClick } })

			const badge = screen.getByRole('button', { name: 'Новое' })
			expect(badge).toHaveAttribute('aria-disabled', 'true')
			await user.tab()
			expect(badge).not.toHaveFocus()
			await user.click(badge)
			await fireEvent.keyDown(badge, { key: 'Enter' })
			await fireEvent.keyDown(badge, { key: ' ' })
			expect(onClick).not.toHaveBeenCalled()
		})
	})
})

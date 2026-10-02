import '@testing-library/jest-dom/vitest'
import BaseChip from '../ui/BaseChip.vue'
import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseChip integration', () => {
	it('должен эмитить click-badge при клике на индикатор', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseChip, {
			props: { content: 5 },
		})

		await user.click(screen.getByText('5'))
		expect(emitted()).toHaveProperty('click-badge')
	})

	describe('клавиатура индикатора (fu-keyboard)', () => {
		it('с @click-badge — кнопка «Индикатор: 99+», Enter и Space вызывают click-badge', async () => {
			const user = userEvent.setup()
			const onClickBadge = vi.fn()
			render(BaseChip, {
				props: { content: 120, hasOverflow: true, 'onClick-badge': onClickBadge },
				slots: { default: '<span>Почта</span>' },
			})

			const badge = screen.getByRole('button', { name: formatMessage(UI_ARIA.CHIP_BADGE, { value: '99+' }) })
			await user.tab()
			expect(badge).toHaveFocus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')
			await user.click(badge)
			expect(onClickBadge).toHaveBeenCalledTimes(3)
		})

		it('без обработчика — индикатор не кнопка и без имени', () => {
			render(BaseChip, { props: { content: 5 }, slots: { default: '<span>Почта</span>' } })

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(screen.getByText('5')).not.toHaveAttribute('aria-label')
			expect(screen.getByText('5')).not.toHaveAttribute('tabindex')
		})
	})
})

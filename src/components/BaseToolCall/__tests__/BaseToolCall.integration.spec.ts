import '@testing-library/jest-dom/vitest'
import BaseToolCall from '../ui/BaseToolCall.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseToolCall integration', () => {
	it('раскрывается по Tab и Enter; блок кода достижим с клавиатуры', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseToolCall, { props: { name: 'search', status: 'success', args: { q: 1 } } })
		const trigger = screen.getByRole('button', { name: 'search Готово' })

		await user.tab()
		expect(trigger).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await user.tab()
		expect(container.querySelector('pre')).toHaveFocus()
	})
})

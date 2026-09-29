import '@testing-library/jest-dom/vitest'
import BaseReasoning from '../ui/BaseReasoning.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseReasoning integration', () => {
	it('раскрывается по Tab и Enter, сворачивается по Space', async () => {
		const user = userEvent.setup()
		render(BaseReasoning, { props: { content: 'Ход мысли', duration: 5 } })
		const trigger = screen.getByRole('button', { name: 'Думал 5 с' })

		await user.tab()
		expect(trigger).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await user.keyboard(' ')
		expect(trigger).toHaveAttribute('aria-expanded', 'false')
	})
})

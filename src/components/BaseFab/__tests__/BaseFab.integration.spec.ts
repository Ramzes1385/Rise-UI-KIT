import '@testing-library/jest-dom/vitest'
import BaseFab from '../ui/BaseFab.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseFab integration', () => {
	it('Tab, Enter и пробел нажимают кнопку', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseFab, { props: { label: 'Новая задача' } })

		await user.tab()
		expect(screen.getByRole('button', { name: 'Новая задача' })).toHaveFocus()
		await user.keyboard('{Enter}')
		await user.keyboard(' ')

		expect(emitted().click).toHaveLength(2)
	})
})

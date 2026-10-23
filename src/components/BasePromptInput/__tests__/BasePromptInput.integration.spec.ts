import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BasePromptInput from '../ui/BasePromptInput.vue'

describe('BasePromptInput integration', () => {
	it('Tab, набор, Shift+Enter — новая строка, Enter — отправка', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BasePromptInput)
		const field = screen.getByRole('textbox', { name: 'Сообщение' })

		await user.tab()
		expect(field).toHaveFocus()
		await user.keyboard('ab{Shift>}{Enter}{/Shift}c')
		expect(field).toHaveValue('ab\nc')
		await user.keyboard('{Enter}')
		expect(emitted('submit')).toEqual([['ab\nc']])
		expect(field).toHaveValue('')
	})
})

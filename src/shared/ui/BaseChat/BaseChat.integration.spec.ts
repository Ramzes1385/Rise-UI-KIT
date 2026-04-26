/**
 * Integration-тесты для BaseChat.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseChat from './BaseChat.vue'

describe('BaseChat integration', () => {
	it('должен эмитить send при отправке сообщения', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseChat, {
			props: { messages: [] },
		})

		const input = screen.getByPlaceholderText('Введите сообщение...')
		await user.type(input, 'Hello{enter}')

		expect(emitted()).toHaveProperty('send')
		expect(emitted().send[0]).toEqual(['Hello'])
	})
})

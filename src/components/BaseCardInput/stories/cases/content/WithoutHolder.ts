import { VISA_NUMBER } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithoutHolder: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Без поля имени (`hasHolder: false`) — когда эквайеру имя не нужно. С кода фокус дальше не уходит.',
			},
		},
	},
	args: { hasHolder: false },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByLabelText('Имя владельца')).toBeNull()
		await userEvent.click(canvas.getByLabelText('Номер карты'))
		await userEvent.keyboard(VISA_NUMBER)
		await waitFor(() => expect(canvas.getByLabelText('Срок действия')).toHaveFocus())
		await userEvent.keyboard('1234')
		const code = canvas.getByLabelText('Код CVV2')
		await waitFor(() => expect(code).toHaveFocus())
		await userEvent.keyboard('123')
		await expect(code).toHaveValue('123')
		await expect(code).toHaveFocus()
	},
}

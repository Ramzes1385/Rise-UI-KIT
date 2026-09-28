import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const AllowedChars: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Фильтр символов `allowedChars="digits"`: буквы не вводятся.' } } },
	args: { label: 'Код из СМС', type: 'text', placeholder: '', allowedChars: 'digits' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Код из СМС')
		await userEvent.type(field, '12ab34')
		await expect(field).toHaveValue('1234')
	},
}

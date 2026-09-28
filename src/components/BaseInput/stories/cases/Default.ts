import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: введите текст в поле или меняйте props в Controls — значение синхронизировано.' } },
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await userEvent.type(field, 'anna@example.com')
		await expect(field).toHaveValue('anna@example.com')
	},
}

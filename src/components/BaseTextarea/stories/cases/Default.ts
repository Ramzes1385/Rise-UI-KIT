import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: введите текст в поле или меняйте props в Controls — значение синхронизировано.' } },
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await userEvent.type(field, 'Позвоните за час')
		await expect(field).toHaveValue('Позвоните за час')
	},
}

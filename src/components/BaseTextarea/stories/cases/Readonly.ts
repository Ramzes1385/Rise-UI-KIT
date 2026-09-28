import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Readonly: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Только чтение: текст можно выделить и скопировать, но не изменить. Фон — приглушённый.' } },
	},
	args: { modelValue: 'Оставить у двери, домофон 24', isReadonly: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await userEvent.type(field, ' и позвонить')
		await expect(field).toHaveValue('Оставить у двери, домофон 24')
	},
}

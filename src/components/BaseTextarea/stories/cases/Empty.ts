import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустое поле: виден плейсхолдер, значение — пустая строка.' } } },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'Например, код домофона или удобное время доставки')
	},
}

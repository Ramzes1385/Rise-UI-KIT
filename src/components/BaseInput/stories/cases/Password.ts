import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Password: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пароль: кнопка в поле показывает и скрывает введённое значение.' } } },
	args: { label: 'Пароль', type: 'password', placeholder: '', modelValue: 'secret-2025' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Пароль')
		await expect(field).toHaveAttribute('type', 'password')
		await userEvent.click(canvas.getByRole('button', { name: 'Показать пароль' }))
		await expect(field).toHaveAttribute('type', 'text')
	},
}

import { expect } from 'storybook/test'
import type meta from '../BaseForm.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённая форма: приглушена, поля и кнопки отключены (в том числе для клавиатуры), `submit` не вызывается.',
			},
		},
	},
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Имя')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
		await expect(canvas.queryByRole('status')).toBeNull()
	},
}

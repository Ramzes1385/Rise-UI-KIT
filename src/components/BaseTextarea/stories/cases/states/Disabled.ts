import { expect } from 'storybook/test'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: приглушено, недоступно для фокуса и ввода.' } } },
	args: { modelValue: 'Оставить у двери, домофон 24', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Комментарий к заказу')).toBeDisabled()
	},
}

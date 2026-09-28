import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Readonly: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Только чтение: значение можно выделить и скопировать, но не изменить. Фон — приглушённый.' } },
	},
	args: { modelValue: 'anna@example.com', isReadonly: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await userEvent.type(field, 'x')
		await expect(field).toHaveValue('anna@example.com')
	},
}

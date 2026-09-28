import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустое поле: виден плейсхолдер, значение — пустая строка.' } } },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Email')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'name@example.com')
	},
}

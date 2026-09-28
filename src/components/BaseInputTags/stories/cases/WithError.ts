import { expect } from 'storybook/test'
import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: текст под полем описывает его.' } } },
	args: { modelValue: [], isRequired: true, error: 'Добавьте хотя бы один навык' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Навыки' })).toHaveAccessibleDescription('Добавьте хотя бы один навык')
	},
}

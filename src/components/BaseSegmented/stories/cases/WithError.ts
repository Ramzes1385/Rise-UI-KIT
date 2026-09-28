import { expect } from 'storybook/test'
import type meta from '../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: рамка дорожки цвета ошибки, текст описывает группу.' } } },
	args: { modelValue: null, error: 'Выберите период' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('radiogroup', { name: 'Период отчёта' })).toHaveAccessibleDescription('Выберите период')
	},
}

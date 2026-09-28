import { expect } from 'storybook/test'
import type meta from '../BaseInplace.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустое значение: плейсхолдер приглушён.' } } },
	args: { modelValue: '' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Название проекта: Без названия' })).toBeVisible()
	},
}

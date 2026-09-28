import { expect } from 'storybook/test'
import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: теги видны, удалить и добавить нельзя.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Навыки' })).toBeDisabled()
		await expect(canvas.queryByRole('button', { name: 'Удалить Vue' })).toBeNull()
	},
}

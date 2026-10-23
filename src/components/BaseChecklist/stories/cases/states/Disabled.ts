import { expect } from 'storybook/test'
import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только просмотр: флажки и кнопки неактивны.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		for (const checkbox of canvas.getAllByRole('checkbox')) await expect(checkbox).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Открыть инструкцию' })).toBeDisabled()
	},
}

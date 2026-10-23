import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая группа: все флажки недоступны, отмеченные остаются видны.' } } },
	args: { isDisabled: true, modelValue: ['email', 'push'] },
	play: async ({ canvas }) => {
		for (const checkbox of canvas.getAllByRole('checkbox')) await expect(checkbox).toBeDisabled()
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toBeChecked()
	},
}

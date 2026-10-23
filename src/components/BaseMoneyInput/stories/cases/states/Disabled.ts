import { expect } from 'storybook/test'
import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: сумма видна, но не меняется.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Сумма')).toBeDisabled()
		await expect((canvas.getByLabelText('Сумма') as HTMLInputElement).value).toMatch(/^1\s234,50$/)
	},
}

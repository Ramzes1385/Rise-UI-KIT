import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый разделитель не двигается и не получает фокус.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		const separator = canvas.getByRole('separator')
		await expect(separator).toHaveAttribute('aria-disabled', 'true')
		await expect(separator).not.toHaveAttribute('tabindex')
	},
}

import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: тяните разделитель мышью или стрелками, размер виден в Controls.' } } },
	play: async ({ canvas, args }) => {
		const separator = canvas.getByRole('separator', { name: 'Список писем' })
		await expect(separator).toHaveAttribute('aria-valuenow', '35')
		await expect(separator).toHaveAttribute('aria-controls', canvas.getByRole('list', { name: 'Письма' }).parentElement?.id)
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}

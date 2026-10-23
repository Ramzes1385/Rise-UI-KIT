import type meta from '../BaseTabs.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клик по вкладке эмитит `update:modelValue` и `change` с её `id`.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Характеристики' }))
		await expect(args.onChange).toHaveBeenCalledWith('specs')
		await waitFor(() => expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveAttribute('aria-selected', 'true'))
		await expect(canvas.getByRole('tab', { name: 'Обзор' })).toHaveAttribute('aria-selected', 'false')
	},
}

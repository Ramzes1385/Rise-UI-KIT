import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Кликабельный индикатор (с `@click-badge`) — история ClickableBadge.',
			},
		},
	},
	play: async ({ canvas }) => {
		const badge = canvas.getByText('5').closest('.base-chip__badge') as HTMLElement
		await expect(badge.getBoundingClientRect().height).toBe(18)
		await expect(canvas.getAllByRole('button')).toHaveLength(1)
	},
}

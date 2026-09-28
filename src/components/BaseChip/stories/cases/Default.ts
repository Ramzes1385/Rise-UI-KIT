import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: меняйте props в панели Controls. Клик по индикатору вызывает событие `click-badge`.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const badge = canvas.getByText('5')
		await expect(badge.getBoundingClientRect().height).toBe(18)
		await userEvent.click(badge)
		await expect(args['onClick-badge']).toHaveBeenCalledOnce()
	},
}

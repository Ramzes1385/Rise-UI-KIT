import { expect, fn } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	args: { onClick: fn() },
	parameters: {
		docs: { description: { story: 'Песочница: меняйте props в панели Controls. Клик по бейджу вызывает событие `click`.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const badge = canvas.getByText('Новый')
		await expect(badge.closest('.base-badge')?.getBoundingClientRect().height).toBe(20)
		await userEvent.click(badge)
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

import { expect } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Без обработчика `@click` бейдж — текст без роли и фокуса; кликабельный бейдж — история Clickable.',
			},
		},
	},
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Новый').closest('.base-badge')
		await expect(badge?.getBoundingClientRect().height).toBe(20)
		await expect(canvas.queryByRole('button')).toBeNull()
	},
}

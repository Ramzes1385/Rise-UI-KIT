import { expect } from 'storybook/test'
import type meta from '../BaseAvatar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Без `src` видны инициалы из `name`; кликабельный аватар (с `@click`) — история Clickable.',
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('АС')).toBeVisible()
		await expect(canvas.queryByRole('button')).toBeNull()
	},
}

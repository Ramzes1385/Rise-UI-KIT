import { expect } from 'storybook/test'
import type meta from '../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте props в панели Controls. Значение сообщается скринридеру через `aria-valuenow`.' },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Прогресс' })).toHaveAttribute('aria-valuenow', '60')
	},
}

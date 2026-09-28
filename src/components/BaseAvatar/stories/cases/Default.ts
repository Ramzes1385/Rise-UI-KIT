import { expect } from 'storybook/test'
import type meta from '../BaseAvatar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Без `src` видны инициалы из `name`; клик вызывает событие `click`.',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const initials = canvas.getByText('АС')
		await userEvent.click(initials)
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

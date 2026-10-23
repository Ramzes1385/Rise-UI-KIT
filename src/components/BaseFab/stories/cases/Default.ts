import { expect } from 'storybook/test'
import type meta from '../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: круглая кнопка в правом нижнем углу рамки.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новая задача' }))
		await expect(args.onClick).toHaveBeenCalledTimes(1)
	},
}

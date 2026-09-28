import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: кнопка в порядке Tab, Enter и пробел нажимают её.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const fab = canvas.getByRole('button', { name: 'Новая задача' })
		await tabTo(fab, userEvent)
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}

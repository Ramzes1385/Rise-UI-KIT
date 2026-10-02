import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте props в панели Controls. Элемент достижим клавишей Tab и срабатывает по Enter.' },
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const control = canvas.getByRole('button', { name: 'Вершина' })
		await tabTo(control, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledOnce()
	},
}

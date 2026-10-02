import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BasePresentationPlayer.stories'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слайды-картинки с показом по `duration`. Кнопка «Следующий слайд» достижима клавишей Tab.' },
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(args['onUpdate:slide']).toHaveBeenCalledWith(1)
	},
}

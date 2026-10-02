import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseEventCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте props в панели Controls. Элемент достижим клавишей Tab и срабатывает по Enter.' },
		},
	},
	play: async ({ canvas, userEvent }) => {
		const control = canvas.getByRole('button', { name: 'Сегодня' })
		await tabTo(control, userEvent)
		await expect(control).toHaveFocus()
	},
}

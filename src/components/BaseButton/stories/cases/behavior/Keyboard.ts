import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab переводит фокус (видно кольцо фокуса), Enter и Space нажимают кнопку.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Сохранить' })
		await tabTo(button, userEvent)
		await expect(getComputedStyle(button).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}

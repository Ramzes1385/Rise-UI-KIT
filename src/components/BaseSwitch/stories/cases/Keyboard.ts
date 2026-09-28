import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseSwitch.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab ставит фокус (видно кольцо вокруг трека), Space включает и выключает.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const toggle = canvas.getByRole('switch', { name: 'Уведомления по email' })
		await tabTo(toggle, userEvent)
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		await expect(getComputedStyle(track).outlineStyle).toBe('solid')
		await userEvent.keyboard(' ')
		await expect(toggle).toBeChecked()
		await userEvent.keyboard(' ')
		await expect(toggle).not.toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(false)
	},
}

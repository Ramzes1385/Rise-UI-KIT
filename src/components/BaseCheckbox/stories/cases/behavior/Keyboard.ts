import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab ставит фокус (видно кольцо вокруг квадрата), Space переключает чекбокс.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Получать новости и специальные предложения' })
		await tabTo(checkbox, userEvent)
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		await expect(getComputedStyle(box).outlineStyle).toBe('solid')
		await userEvent.keyboard(' ')
		await expect(checkbox).toBeChecked()
		await userEvent.keyboard(' ')
		await expect(checkbox).not.toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(false)
	},
}

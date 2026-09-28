import { tabTo } from '@/stories/helpers'
import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: цифры фильтруют список по началу времени, ↓ ведёт по нему, Enter выбирает.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('16')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(2))
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('16:30')
	},
}

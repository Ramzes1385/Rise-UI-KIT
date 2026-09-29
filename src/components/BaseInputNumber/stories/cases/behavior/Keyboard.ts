import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: ↑/↓ — шаг, PageUp/PageDown — десять шагов (с границей), Home/End — min и max.' } },
	},
	tags: ['!autodocs'],
	args: { max: 50 },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('{ArrowUp}')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
		await userEvent.keyboard('{PageUp}')
		await expect(args.onChange).toHaveBeenLastCalledWith(13)
		await userEvent.keyboard('{End}')
		await expect(args.onChange).toHaveBeenLastCalledWith(50)
		await userEvent.keyboard('{Home}')
		await expect(args.onChange).toHaveBeenLastCalledWith(1)
		await expect(field).toHaveValue('1')
	},
}

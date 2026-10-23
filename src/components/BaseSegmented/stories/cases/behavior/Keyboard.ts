import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab — на выбранный сегмент, стрелки переключают выбор (недоступный пропускается).' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const week = canvas.getByRole('radio', { name: 'Неделя' })
		await tabTo(week, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'Месяц' })).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('month')
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'День' })).toHaveFocus()
	},
}

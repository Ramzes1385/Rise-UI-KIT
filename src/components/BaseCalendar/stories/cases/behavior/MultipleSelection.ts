import { fn, expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { renderWithLocalModel, getDay } from '../../shared'

export const MultipleSelection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Несколько дат (`selectionMode="multiple"`): клик добавляет дату в `selectedDates`, повторный — убирает.',
			},
		},
	},
	args: {
		selectionMode: 'multiple',
		selectedDates: [storyDate(-7, 0, 0), storyDate(0, 0, 0)],
		'onUpdate:selectedDates': fn(),
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(getDay(canvas, 5))
		await expect(args['onUpdate:selectedDates']).toHaveBeenLastCalledWith([storyDate(-7, 0, 0), storyDate(0, 0, 0), storyDate(5, 0, 0)])
		await userEvent.click(getDay(canvas, 0))
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
		await expect(getDay(canvas, 5)).toHaveAttribute('aria-pressed', 'true')
	},
}

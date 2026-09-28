import { getDay } from '../shared'
import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Constraints: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ограничения `constraints`: даты вне `minDate`…`maxDate`, дни недели `disabledWeekdays` и даты `disabledDates`',
					'недоступны — текст приглушён, наведения и клика нет.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: storyDate(0, 0, 0),
		constraints: {
			minDate: storyDate(-10, 0, 0),
			maxDate: storyDate(20, 0, 0),
			disabledWeekdays: [0, 6],
			disabledDates: [storyDate(6, 0, 0)],
		},
	},
	play: async ({ canvas }) => {
		await expect(getDay(canvas, -13)).toBeDisabled()
		await expect(getDay(canvas, -10)).toBeEnabled()
		await expect(getDay(canvas, 2)).toBeDisabled()
		await expect(getDay(canvas, 6)).toBeDisabled()
		await expect(getDay(canvas, 21)).toBeDisabled()
	},
}

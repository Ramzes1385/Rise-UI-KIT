import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WeekNumbers: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Номера недель ISO (`displayConfig.showWeekNumber`) — колонка слева от сетки.' } } },
	args: { modelValue: storyDate(0, 0, 0), displayConfig: { showWeekNumber: true } },
	play: async ({ canvasElement }) => {
		const weeks = Array.from(canvasElement.querySelectorAll('.base-calendar__week-num'), cell => cell.textContent?.trim())
		await expect(weeks).toEqual(['18', '19', '20', '21', '22', '23'])
	},
}

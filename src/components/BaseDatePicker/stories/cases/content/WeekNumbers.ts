import { expect } from 'storybook/test'
import { findPanel } from '../../shared'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, storyDate } from '@/stories/helpers'

export const WeekNumbers: StoryObj<typeof meta> = {
	args: { modelValue: storyDate(0, 0, 0), showWeekNumber: true },
	parameters: {
		docs: {
			...docsFrame(420),
			description: { story: 'Номера недель ISO (`showWeekNumber`) — колонка слева от сетки календаря в панели.' },
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByLabelText('Дата встречи'))
		const panel = await findPanel()
		const weeks = Array.from(panel.querySelectorAll('.base-calendar__week-num'), cell => cell.textContent?.trim())
		await expect(weeks).toEqual(['18', '19', '20', '21', '22', '23'])
	},
}

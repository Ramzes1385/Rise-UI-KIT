import { getDay } from '../../shared'
import { storyDate } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { CalendarHighlight, CalendarWeekends } from '../../../types/BaseCalendar.types'

const HIGHLIGHTS: CalendarHighlight[] = [
	{ date: storyDate(-6), color: 'var(--rise-info)', label: 'Созвон с заказчиком' },
	{ date: storyDate(5), color: 'var(--rise-success)', label: 'Сдача монтажа' },
	{ date: storyDate(5), color: 'var(--rise-warning)', label: 'Ревью субтитров' },
	{ date: storyDate(12), color: 'var(--rise-error)', label: 'Релиз серии' },
]

const WEEKENDS: CalendarWeekends = {
	days: [0, 6],
	holidays: [storyDate(-14), storyDate(-6)],
}

export const Events: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'События и выходные: `highlights` — точки под датами (цвет из данных), `weekends` — выходные и праздники красным.',
					'С `showDatePopover` клик по дню открывает popover с датой и событиями.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: null, highlights: HIGHLIGHTS, weekends: WEEKENDS, showDatePopover: true },
	play: async ({ canvas, userEvent }) => {
		const day = getDay(canvas, 5)
		await expect(day).toHaveAccessibleName(/Сдача монтажа/)
		await userEvent.click(day)
		const event = await canvas.findByText('Ревью субтитров')

		await userEvent.click(event)
		await expect(canvas.getByText('Ревью субтитров')).toBeVisible()
		await userEvent.click(canvas.getByText('пн'))
		await waitFor(() => expect(canvas.queryByText('Ревью субтитров')).not.toBeInTheDocument())

		await userEvent.click(getDay(canvas, 5))
		await expect(await canvas.findByText('Ревью субтитров')).toBeVisible()
	},
}

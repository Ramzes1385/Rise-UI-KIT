import { getDay } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { literal, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const models = { date: 'modelValue' }

const TODAY = storyDate(10)

const template = `
	<div class="story-narrow" style="--rise-calendar-day-ring: var(--rise-primary);">
		<BaseCalendar v-bind="args" v-model="date" :today="today" />
	</div>
`

export const CalendarToday: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Проп `today` задаёт «сегодня»: на этом дне кольцо `--rise-calendar-day-ring` и `aria-current="date"`, к нему ведёт кнопка',
					'«Сегодня». Без пропа календарь берёт текущую дату по часам. Здесь «сегодня» — 25 мая 2025, поэтому пример выглядит',
					'одинаково в любой день: нужно историям, снимкам и тестам.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCalendar'], models, script: `const today = ${literal(TODAY)}` }),
		},
	},
	args: { modelValue: null },
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { models, slots: [], data: { today: TODAY } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const today = getDay(canvas, 10)
		await expect(today).toHaveAttribute('aria-current', 'date')
		await expect(getComputedStyle(today).boxShadow).not.toBe('none')
		await expect(getComputedStyle(today).boxShadow).not.toContain('rgba(0, 0, 0, 0)')

		await userEvent.click(canvas.getByRole('button', { name: 'Следующий месяц' }))
		await waitFor(() => expect(canvasElement.querySelector('[aria-current="date"]')).toBeNull())

		await userEvent.click(canvas.getByRole('button', { name: 'Сегодня' }))
		await waitFor(() => expect(getDay(canvas, 10)).toHaveAttribute('aria-pressed', 'true'))
		await expect(getDay(canvas, 10)).toHaveAttribute('aria-current', 'date')
	},
}

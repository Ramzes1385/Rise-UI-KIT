import { ref } from 'vue'
import type { Ref } from 'vue'
import { expect } from 'storybook/test'
import { models } from '../../../render'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseEventCalendar.stories'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import BaseEventCalendar from '../../../../ui/BaseEventCalendar.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import type { EventCalendarChange } from '../../../../types/BaseEventCalendar.types'

const EVENTS: CalendarEvent[] = [
	{
		id: 'planning',
		title: 'Планёрка',
		start: '2026-09-28T09:30',
		end: '2026-09-28T10:00',
		rrule: 'FREQ=WEEKLY;BYDAY=MO,WE',
	},
]

const template = `
	<BaseEventCalendar
		v-bind="args"
		v-model:view="view"
		v-model:date="date"
		:events="events"
		is-editable
		@event-change="move" />
`

const script = `
function move({ event, start, end, oldStart }: EventCalendarChange): void {
	if (!event.rrule) {
		events.value = events.value.map(item => (item.id === event.id ? { ...item, start, end } : item))
		return
	}
	const series = { ...event, exdates: [...(event.exdates ?? []), oldStart] }
	const single = { id: \`\${event.id}-\${oldStart.getTime()}\`, title: event.title, start, end, color: event.color }
	events.value = [...events.value.map(item => (item.id === event.id ? series : item)), single]
}
`

function useRecurring(): { events: Ref<CalendarEvent[]>; move: (change: EventCalendarChange) => void } {
	const events = ref<CalendarEvent[]>(structuredClone(EVENTS))
	return {
		events,
		move: ({ event, start, end, oldStart }) => {
			if (!event.rrule) {
				events.value = events.value.map(item => (item.id === event.id ? { ...item, start, end } : item))
				return
			}
			const series = { ...event, exdates: [...(event.exdates ?? []), oldStart] }
			const single = { id: `${event.id}-${oldStart.getTime()}`, title: event.title, start, end, color: event.color }
			events.value = [...events.value.map(item => (item.id === event.id ? series : item)), single]
		},
	}
}

export const RecurringEdit: StoryObj<typeof meta> = {
	args: { view: 'week' },
	parameters: {
		controls: { exclude: ['events'] },
		docs: {
			description: {
				story: [
					'Перенос повтора: `event-change` приходит со временем этого повтора (`oldStart` — его прежнее начало), а что',
					'менять — серию или один повтор — решает приложение. Здесь перенесён один повтор: его начало ушло в `exdates`',
					'серии, а на новое время добавлено отдельное событие. Планёрка — по понедельникам и средам.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEventCalendar', 'type EventCalendarChange'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type CalendarEvent'] },
				models,
				omit: ['events'],
				state: { events: EVENTS },
				types: { events: 'CalendarEvent[]' },
				script,
			}),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], setup: useRecurring }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await tabTo(canvas.getByRole('button', { name: 'Планёрка, 30 сентября, 09:30–10:00' }), userEvent, 40)
		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await userEvent.keyboard('{Enter}')
		await expect(args['onEvent-change']).toHaveBeenLastCalledWith(
			expect.objectContaining({
				type: 'move',
				start: new Date(2026, 8, 30, 10, 30),
				oldStart: new Date(2026, 8, 30, 9, 30),
				event: expect.objectContaining({ id: 'planning' }),
			}),
		)
		await expect(canvas.getByRole('button', { name: 'Планёрка, 30 сентября, 10:30–11:00' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Планёрка, 28 сентября, 09:30–10:00' })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Планёрка, 30 сентября, 09:30–10:00' })).toBeNull()
	},
}

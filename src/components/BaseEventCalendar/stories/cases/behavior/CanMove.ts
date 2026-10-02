import { models } from '../../render'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { EDIT_EVENTS, MOVE_SCRIPT, useMovableEvents } from '../../shared'
import type { EventCalendarChange } from '../../../types/BaseEventCalendar.types'

const template = `
	<BaseEventCalendar
		v-bind="args"
		v-model:view="view"
		v-model:date="date"
		:events="events"
		is-editable
		:can-move="isWorkday"
		@event-change="move" />
`

const script = `
const isWorkday = ({ start }: EventCalendarChange): boolean => ![0, 6].includes(start.getDay())
${MOVE_SCRIPT}`

const isWorkday = ({ start }: EventCalendarChange): boolean => ![0, 6].includes(start.getDay())

export const CanMove: StoryObj<typeof meta> = {
	args: { view: 'week' },
	parameters: {
		docs: {
			description: {
				story: [
					'`can-move` — запрет: функция получает готовое изменение (`EventCalendarChange`) на каждом шаге и возвращает',
					'false, если событие сюда класть нельзя. Здесь — не на выходные: мышью место отмечается красным пунктиром',
					'и курсором «нельзя», с клавиатуры шаг не делается и озвучивается «Сюда событие … положить нельзя».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEventCalendar', 'type EventCalendarChange'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type CalendarEvent'] },
				models,
				state: { events: EDIT_EVENTS },
				types: { events: 'CalendarEvent[]' },
				script,
			}),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], data: { isWorkday }, setup: () => useMovableEvents() }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const status = canvas.getByRole('status')
		const meeting = canvas.getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' })
		await tabTo(meeting, userEvent, 40)
		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowRight}')
		await expect(status).toHaveTextContent('Сюда событие «Встреча с командой» положить нельзя')
		await expect(meeting).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(status).toHaveTextContent('1 октября, 10:00–11:00')
		await userEvent.keyboard('{Enter}')
		await expect(args['onEvent-change']).toHaveBeenLastCalledWith(
			expect.objectContaining({ type: 'move', start: new Date(2026, 9, 1, 10), end: new Date(2026, 9, 1, 11) }),
		)
		await expect(canvas.getByRole('button', { name: 'Встреча с командой, 1 октября, 10:00–11:00' })).toHaveFocus()
	},
}

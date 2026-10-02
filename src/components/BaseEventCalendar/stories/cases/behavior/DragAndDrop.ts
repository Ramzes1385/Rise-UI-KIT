import { models } from '../../render'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { EDIT_EVENTS, MOVE_SCRIPT, useMovableEvents } from '../../shared'

const template = `
	<BaseEventCalendar
		v-bind="args"
		v-model:view="view"
		v-model:date="date"
		:events="events"
		is-editable
		@event-change="move" />
`

export const DragAndDrop: StoryObj<typeof meta> = {
	args: { view: 'week' },
	parameters: {
		controls: { exclude: ['events'] },
		docs: {
			description: {
				story: [
					'`is-editable` — перенос и растягивание. Мышью: событие тянут за тело, длительность меняют за нижний край блока',
					'в сетке времени или правый край полосы «Весь день». С клавиатуры: Space берёт событие, стрелки двигают на шаг',
					'сетки (↑/↓) или день (←/→), Shift со стрелками меняет длительность, Enter кладёт, Escape отменяет. Итог —',
					'`event-change` (`{ type, event, start, end, allDay, oldStart, oldEnd }`): календарь не меняет `events` сам,',
					'новое время записывает приложение — без этого событие вернётся на место.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEventCalendar', 'type EventCalendarChange'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type CalendarEvent'] },
				models,
				omit: ['events'],
				state: { events: EDIT_EVENTS },
				types: { events: 'CalendarEvent[]' },
				script: MOVE_SCRIPT,
			}),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], setup: () => useMovableEvents() }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const status = canvas.getByRole('status')
		await tabTo(canvas.getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' }), userEvent, 40)
		await userEvent.keyboard(' ')
		await expect(status).toHaveTextContent(/^Событие «Встреча с командой» взято: 2 октября, 10:00–11:00\./)
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{ArrowRight}')
		await expect(status).toHaveTextContent('3 октября, 10:30–11:30')
		await userEvent.keyboard('{Enter}')
		await expect(status).toHaveTextContent('Событие «Встреча с командой» перенесено: 3 октября, 10:30–11:30')
		await expect(args['onEvent-change']).toHaveBeenLastCalledWith(
			expect.objectContaining({
				type: 'move',
				start: new Date(2026, 9, 3, 10, 30),
				end: new Date(2026, 9, 3, 11, 30),
				oldStart: new Date(2026, 9, 2, 10),
			}),
		)
		const moved = canvas.getByRole('button', { name: 'Встреча с командой, 3 октября, 10:30–11:30' })
		await expect(moved).toHaveFocus()

		await userEvent.keyboard(' ')
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
		await userEvent.keyboard('{Enter}')
		await expect(args['onEvent-change']).toHaveBeenLastCalledWith(
			expect.objectContaining({ type: 'resize', start: new Date(2026, 9, 3, 10, 30), end: new Date(2026, 9, 3, 12) }),
		)
		const longer = canvas.getByRole('button', { name: 'Встреча с командой, 3 октября, 10:30–12:00' })

		const calls = (args['onEvent-change'] as unknown as { mock: { calls: unknown[] } }).mock.calls.length
		await expect(longer).toHaveFocus()
		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowUp}')
		await userEvent.keyboard('{Escape}')
		await expect(status).toHaveTextContent('Перенос отменён, событие «Встреча с командой» на прежнем месте')
		await expect(args['onEvent-change']).toHaveBeenCalledTimes(calls)
		await expect(canvas.getByRole('button', { name: 'Встреча с командой, 3 октября, 10:30–12:00' })).toHaveFocus()
	},
}

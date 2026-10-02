import { ref } from 'vue'
import { expect } from 'storybook/test'
import { models } from '../../../render'
import { getDay } from '../../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../../ui/BaseEventCalendar.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import type { EventCalendarSelection } from '../../../../types/BaseEventCalendar.types'

const template = `
	<div class="story-stack">
		<BaseEventCalendar
			v-bind="args"
			v-model:view="view"
			v-model:date="date"
			is-selectable
			@select="report('select', $event)"
			@create="report('create', $event)" />
		<p class="story-label">{{ log }}</p>
	</div>
`

const script = `
const log = ref('Выделите дни или время')

const format = (date: Date): string => date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })

function report(name: string, { start, end, allDay }: EventCalendarSelection): void {
	log.value = [name, format(start), '—', format(end), allDay ? '(весь день)' : ''].join(' ').trim()
}
`

const format = (date: Date): string => date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })

export const Selectable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`is-selectable` — выделение и создание. Мышью: протянуть по дням месяца или по времени в неделе и дне — событие',
					'`select`, нажать пустое место — `create` (`{ start, end, allDay }`, `end` не входит). С клавиатуры: в месяце —',
					'Shift со стрелками от выбранного дня; в неделе и дне колонка дня — одна точка Tab с курсором шага: ↑/↓ — шаг,',
					'←/→ — день, Shift — выделение. Enter — `select` (есть выделение) или `create`, Escape снимает выделение.',
					'Новое событие календарь не добавляет сам — это делает приложение по `select` или `create`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEventCalendar', 'type EventCalendarSelection'], models, vue: ['ref'], script }),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, {
			models,
			slots: [],
			setup: () => {
				const log = ref('Выделите дни или время')
				return {
					log,
					report: (name: string, { start, end, allDay }: EventCalendarSelection) => {
						log.value = [name, format(start), '—', format(end), allDay ? '(весь день)' : ''].join(' ').trim()
					},
				}
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const status = canvas.getByRole('status')
		await tabTo(getDay(canvasElement, '2026-10-02'), userEvent)
		await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{/Shift}')
		await expect(status).toHaveTextContent('Выделено: 2 октября — 4 октября')
		await expect(getDay(canvasElement, '2026-10-03')).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenLastCalledWith(
			expect.objectContaining({ start: new Date(2026, 9, 2), end: new Date(2026, 9, 5), allDay: true }),
		)
		await expect(canvas.getByText(/^select 02\.10\.2026, 00:00 — 05\.10\.2026, 00:00 \(весь день\)$/)).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await expect(status).toHaveTextContent('Выделение снято')
		await userEvent.keyboard('{Enter}')
		await expect(args.onCreate).toHaveBeenLastCalledWith(
			expect.objectContaining({ start: new Date(2026, 9, 4), end: new Date(2026, 9, 5), allDay: true }),
		)

		await userEvent.click(canvas.getByText('Неделя'))
		const column = canvasElement.querySelector<HTMLElement>('.base-event-calendar__column[tabindex="0"]')!
		const [year, month, day] = column.dataset.day!.split('-').map(Number)
		await tabTo(column, userEvent, 40)
		await expect(status).toHaveTextContent(/^\d+ октября, 08:00$/)
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
		await expect(status).toHaveTextContent(/^Выделено: \d+ октября, 08:00–09:30$/)
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenLastCalledWith(
			expect.objectContaining({
				start: new Date(year, month - 1, day, 8),
				end: new Date(year, month - 1, day, 9, 30),
				allDay: false,
			}),
		)
		await expect(column.querySelector('.base-event-calendar__selection')).toBeVisible()
	},
}

import { models } from '../../render'
import { setup } from './Resources.setup'
import { expect, within } from 'storybook/test'
import setupSource from './Resources.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { scriptSource, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseEventCalendar
			v-bind="args"
			v-model:view="view"
			v-model:date="date"
			:events="events"
			:resources="resources"
			is-selectable
			is-editable
			@event-change="move"
			@select="report('select', $event)"
			@create="report('create', $event)" />
		<p class="story-label">{{ log }}</p>
	</div>
`

export const Resources: StoryObj<typeof meta> = {
	args: { view: 'day' },
	parameters: {
		docs: {
			description: {
				story: [
					'`resources` — комнаты, сотрудники, оборудование (`{ id, title, color? }`): в неделе и дне у каждого ресурса свои',
					'колонки (в неделе ресурсы над днями), событие лежит в колонке своего `resourceId`. Цвет события — свой `color`,',
					'иначе цвет ресурса. Событие без `resourceId` в неделе и дне с ресурсами не видно — «Отпуск Анны» есть только',
					'в месяце и списке. Перенос в колонку другого ресурса — `event-change` с `resourceId` и `oldResourceId`;',
					'`select` и `create` получают `resourceId` колонки. С клавиатуры ←/→ переходят и между ресурсами: в дне —',
					'к следующей комнате, в неделе — с последнего дня ресурса на первый день следующего.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEventCalendar', 'type EventCalendarChange', 'type EventCalendarResource', 'type EventCalendarSelection'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type CalendarEvent'] },
				models,
				vue: ['ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const status = canvas.getByRole('status')
		await expect(canvas.getByText('Синяя переговорная')).toBeVisible()
		await expect(canvas.queryByRole('button', { name: /^Отпуск Анны/ })).toBeNull()

		const planning = canvas.getByRole('button', { name: 'Планёрка, 2 октября, 10:00–11:00, Синяя переговорная' })
		await tabTo(planning, userEvent, 40)
		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowRight}')
		await expect(status).toHaveTextContent('Зелёная переговорная')
		await userEvent.keyboard('{Enter}')
		await expect(args['onEvent-change']).toHaveBeenLastCalledWith(
			expect.objectContaining({ type: 'move', resourceId: 'green', oldResourceId: 'blue', start: new Date(2026, 9, 2, 10) }),
		)
		const moved = canvas.getByRole('button', { name: 'Планёрка, 2 октября, 10:00–11:00, Зелёная переговорная' })
		await expect(moved).toHaveFocus()
		const green = canvasElement.querySelector<HTMLElement>('[data-column="green|2026-10-02"]')!
		await expect(within(green).getByRole('button', { name: /^Планёрка/ })).toBe(moved)

		const column = canvasElement.querySelector<HTMLElement>('[role="group"][tabindex="0"]')!
		await tabTo(column, userEvent, 40)
		await expect(status).toHaveTextContent(/^Синяя переговорная, /)
		await userEvent.keyboard('{ArrowRight}')
		await userEvent.keyboard('{ArrowRight}')
		await expect(status).toHaveTextContent(/^Большой зал, /)
		await userEvent.keyboard('{Enter}')
		await expect(args.onCreate).toHaveBeenLastCalledWith(expect.objectContaining({ resourceId: 'hall', allDay: false }))
		await expect(canvas.getByText(/^create: Большой зал, /)).toBeVisible()

		await userEvent.click(canvas.getByText('Неделя'))
		await expect(canvas.getByRole('group', { name: /^Большой зал, .*4 окт/ })).toBeVisible()
	},
}

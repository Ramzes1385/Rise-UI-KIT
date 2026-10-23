import { models } from '../../render'
import { expect } from 'storybook/test'
import { setup } from './ManyEvents.setup'
import setupSource from './ManyEvents.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<p class="story-label">Событий: {{ events.length }} · отрисовка периода — {{ renderTime }} мс</p>
		<BaseEventCalendar
			v-bind="args"
			v-model:view="view"
			v-model:date="date"
			:events="events"
			:resources="resources"
			@period-change="measure" />
	</div>
`

export const ManyEvents: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	args: { maxEventsPerDay: 3 },
	parameters: {
		docs: {
			description: {
				story: [
					'Большой объём: 1 200 событий за три месяца, четыре сотрудника-ресурса. Календарь разворачивает и раскладывает',
					'только события показанного периода (`getEventsInRange`), перенос не пересобирает список. Над календарём —',
					'время отрисовки после каждой смены вида или периода (от `period-change` до обновления DOM); переключите',
					'«Неделя» (4 × 7 колонок) и «Список».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEventCalendar', 'type EventCalendarResource'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type CalendarEvent'] },
				models,
				omit: ['events'],
				vue: ['nextTick', 'ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByText(/^Событий: 1200 · отрисовка периода — \d+ мс$/)).toBeVisible()
		await expect(canvas.getAllByRole('button', { name: /^Все события дня: / }).length).toBeGreaterThan(20)

		await userEvent.click(canvas.getByText('Неделя'))
		await expect(canvas.getByRole('group', { name: /^Олег, .*4 окт/ })).toBeVisible()
		await expect(canvas.getAllByRole('button', { name: /№\d+, .*(Анна|Иван|Мария|Олег)$/ }).length).toBeGreaterThan(80)

		await userEvent.click(canvas.getByText('Список'))
		await expect(canvas.getByRole('list', { name: /^пятница, 2 октября/ })).toBeVisible()
	},
}

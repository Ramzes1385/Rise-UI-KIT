import { setup } from './Ics.setup'
import { models } from '../../render'
import { expect } from 'storybook/test'
import setupSource from './Ics.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { scriptSource, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="loadSample">Загрузить пример</BaseButton>
			<label class="story-label">
				Импорт .ics
				<input type="file" accept=".ics,text/calendar" @change="importFile" />
			</label>
			<BaseButton :is-disabled="!events.length" @click="exportFile">Экспорт .ics</BaseButton>
		</div>
		<p class="story-label">{{ log }}</p>
		<BaseEventCalendar v-bind="args" v-model:view="view" v-model:date="date" :events="events" />
	</div>
`

const ONE_EVENT_ICS = [
	'BEGIN:VCALENDAR',
	'BEGIN:VEVENT',
	'UID:board',
	'DTSTART:20261006T110000',
	'DTEND:20261006T120000',
	'SUMMARY:Совет директоров',
	'END:VEVENT',
	'END:VCALENDAR',
].join('\r\n')

export const Ics: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Импорт и экспорт iCalendar (`.ics`, RFC 5545) — утилиты из `@ramzes1385/rise-ui-kit/utils`: `parseIcs(text)` —',
					'события из строки, `readIcsFile(file)` — из файла, который выбрал пользователь, `toIcs(events)` — строка,',
					'`downloadIcs(events, name)` — скачать файлом. Разбираются DTSTART, DTEND или DURATION, SUMMARY, DESCRIPTION,',
					'CATEGORIES, RESOURCES (первый — в `resourceId`), RRULE и EXDATE; время с `TZID` пересчитывается из пояса IANA.',
					'Пример — строка в коде истории, без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseEventCalendar'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['downloadIcs', 'parseIcs', 'readIcsFile', 'type CalendarEvent'] },
				models,
				omit: ['events'],
				vue: ['ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseButton, BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const exportButton = canvas.getByRole('button', { name: 'Экспорт .ics' })
		await expect(exportButton).toBeDisabled()
		await tabTo(canvas.getByRole('button', { name: 'Загрузить пример' }), userEvent, 10)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByText('Импортировано событий: 4')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Ретроспектива, 2 октября, 15:00–16:30' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^Выездная сессия/ })).toBeVisible()
		await expect(canvas.getAllByRole('button', { name: /^Синк команды/ })).toHaveLength(4)
		await expect(exportButton).toBeEnabled()

		const file = new File([ONE_EVENT_ICS], 'board.ics', { type: 'text/calendar' })
		await userEvent.upload(canvas.getByLabelText('Импорт .ics'), file)
		await expect(await canvas.findByText('Импортировано событий: 1')).toBeVisible()
		await expect(await canvas.findByRole('button', { name: 'Совет директоров, 6 октября, 11:00–12:00' })).toBeVisible()
	},
}

import { bodyRows } from '../../shared'
import { within } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import type { TableColumn, TableRow } from '../../../types/BaseTable.types'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const rows: TableRow[] = [
	{ id: 1, data: { event: 'Поздний вечер по UTC', at: Date.UTC(2025, 4, 14, 22, 30) } },
	{ id: 2, data: { event: 'Утро по UTC', at: Date.UTC(2025, 4, 14, 9, 0) } },
	{ id: 3, data: { event: 'Раннее утро следующего дня', at: Date.UTC(2025, 4, 15, 5, 0) } },
]

const columns: TableColumn[] = [
	{ key: 'event', label: 'Событие' },
	{
		key: 'at',
		label: 'Момент',
		sortType: 'date',
		filterConfig: { type: 'date' },
		formatter: value => `${new Date(Number(value)).toISOString().slice(0, 16).replace('T', ' ')} UTC`,
	},
]

const template = `
	<div class="story-stack">
		<span class="story-label">time-zone: UTC</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" time-zone="UTC" />
		<span class="story-label">time-zone: Pacific/Auckland</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" time-zone="Pacific/Auckland" />
	</div>
`

const script = [
	[
		'const rows: TableRow[] = [',
		"\t{ id: 1, data: { event: 'Поздний вечер по UTC', at: Date.UTC(2025, 4, 14, 22, 30) } },",
		"\t{ id: 2, data: { event: 'Утро по UTC', at: Date.UTC(2025, 4, 14, 9, 0) } },",
		"\t{ id: 3, data: { event: 'Раннее утро следующего дня', at: Date.UTC(2025, 4, 15, 5, 0) } },",
		']',
	].join('\n'),
	[
		'const columns: TableColumn[] = [',
		"\t{ key: 'event', label: 'Событие' },",
		'\t{',
		"\t\tkey: 'at',",
		"\t\tlabel: 'Момент',",
		"\t\tsortType: 'date',",
		"\t\tfilterConfig: { type: 'date' },",
		"\t\tformatter: value => `${new Date(Number(value)).toISOString().slice(0, 16).replace('T', ' ')} UTC`,",
		'\t},',
		']',
	].join('\n'),
].join('\n\n')

export const DateFilterTimezone: StoryObj<typeof meta> = {
	args: { features: { filters: true }, behavior: {} },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Фильтр по датам считает сутки момента времени (`Date`, timestamp, ISO-строка с зоной) в поясе пользователя; проп `timeZone`',
					'таблицы (IANA: `Europe/Moscow`, `UTC`) или `filterConfig.timeZone` колонки задаёт другой. Одни и те же три момента,',
					'фильтр «= 14.05.2025»: в UTC подходят два, в Окленде (UTC+12) — один: поздний вечер 14 мая по UTC там уже 15 мая.',
					'Дата без пояса («2025-05-14») — сутки как написано, пояс на неё не влияет.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn', 'type TableRow'],
				script,
				omit: ['columns', 'rows'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns, rows } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const tables = canvas.getAllByRole('table')
		const toolbars = canvas.getAllByRole('toolbar')
		for (const toolbar of toolbars) {
			const scope = within(toolbar)
			await userEvent.click(scope.getByRole('combobox', { name: 'Колонка фильтра' }))
			await userEvent.click(await screen.findByRole('option', { name: 'Момент' }, { timeout: STORY_WAIT_TIMEOUT }))
			await userEvent.click(await scope.findByLabelText('Значение фильтра'))
			await screen.findByRole('button', { name: 'Предыдущий месяц' }, { timeout: STORY_WAIT_TIMEOUT })
			for (let step = 0; step < 120 && !screen.queryByRole('button', { name: /14 мая 2025/ }); step++) {
				await userEvent.click(screen.getByRole('button', { name: 'Предыдущий месяц' }))
			}
			await userEvent.click(await screen.findByRole('button', { name: /14 мая 2025/ }, { timeout: STORY_WAIT_TIMEOUT }))
			await userEvent.click(scope.getByRole('button', { name: 'Добавить' }))
		}
		await waitFor(() => expect(bodyRows(tables[0])).toHaveLength(2))
		await waitFor(() => expect(bodyRows(tables[1])).toHaveLength(1))
	},
}

import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { TableColumn, TableRow } from '../../../types/BaseTable.types'

const WORDS = [
	{ id: 1, word: 'Zebra', date: '15.03.2024' },
	{ id: 2, word: 'Ägir', date: '01.02.2024' },
	{ id: 3, word: 'Apfel', date: '20.12.2023' },
	{ id: 4, word: 'Öl', date: '09.11.2024' },
	{ id: 5, word: 'Ozean', date: '31.01.2024' },
]

const rows: TableRow[] = WORDS.map(item => ({ id: item.id, data: { ...item } }))

const columns: TableColumn[] = [
	{ key: 'word', label: 'Слово', isSortable: true, sortType: 'string' },
	{
		key: 'date',
		label: 'Дата',
		isSortable: true,
		sortType: 'date',
		sortAccessor: row => String(row.data.date).split('.').reverse().join('-'),
	},
]

const template = `
	<div class="story-stack">
		<span class="story-label">sort-locale: sv</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" sort-locale="sv" />
		<span class="story-label">sort-locale: de</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" sort-locale="de" />
	</div>
`

const script = [
	`const rows: TableRow[] = ${literal(WORDS)}.map(item => ({ id: item.id, data: { ...item } }))`,
	[
		'const columns: TableColumn[] = [',
		"\t{ key: 'word', label: 'Слово', isSortable: true, sortType: 'string' },",
		'\t{',
		"\t\tkey: 'date',",
		"\t\tlabel: 'Дата',",
		'\t\tisSortable: true,',
		"\t\tsortType: 'date',",
		"\t\tsortAccessor: row => String(row.data.date).split('.').reverse().join('-'),",
		'\t},',
		']',
	].join('\n'),
].join('\n\n')

function words(table: HTMLElement): string[] {
	return [...table.querySelectorAll('tbody tr')].map(row => row.querySelector('td')?.textContent?.trim() ?? '')
}

export const SortLocale: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Сортировка по языку и по своему значению. `sortLocale` (BCP 47: `sv`, `de`, `ru`) задаёт правила сравнения строк:',
					'в шведском «Ä» стоит после «Z», в немецком — рядом с «A». Без пропса используется язык кита (`defineLocale`).',
					'Числа внутри строк сравниваются как числа («Item 2» перед «Item 10»), пустые значения всегда в конце.',
					'`sortAccessor` колонки отдаёт значение для сортировки вместо `row.data[key]`: здесь даты «ДД.ММ.ГГГГ» переводятся в ISO,',
					'и `sortType: "date"` сравнивает их как даты. Поиск и фильтры по-прежнему читают `row.data[key]`.',
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
		const [swedish, german] = canvas.getAllByRole('table')
		const [swedishWord, germanWord] = canvas.getAllByRole('button', { name: 'Слово' })
		await userEvent.click(swedishWord)
		await userEvent.click(germanWord)
		await waitFor(() => expect(words(swedish)).toEqual(['Apfel', 'Ozean', 'Zebra', 'Ägir', 'Öl']))
		await expect(words(german)).toEqual(['Ägir', 'Apfel', 'Öl', 'Ozean', 'Zebra'])

		const [swedishDate] = canvas.getAllByRole('button', { name: 'Дата' })
		await userEvent.click(swedishDate)
		await waitFor(() => expect(words(swedish)).toEqual(['Apfel', 'Ozean', 'Ägir', 'Zebra', 'Öl']))
	},
}

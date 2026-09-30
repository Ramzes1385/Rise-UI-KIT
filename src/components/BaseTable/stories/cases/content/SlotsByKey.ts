import type meta from '../../BaseTable.stories'
import { expect, within } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseBadge } from '@components/BaseBadge'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { TableColumn, TableRow } from '../../../types/BaseTable.types'

const columns: TableColumn[] = [
	{ key: 'city', label: 'Город' },
	{ key: 'status', label: 'Склад' },
	{ key: 'week', label: 'За неделю' },
	{ key: 'month', label: 'За месяц' },
	{ key: 'year', label: 'За год' },
]

const rows: TableRow[] = [
	{ id: 1, data: { city: 'Москва', status: 'Открыт', week: 12, month: 4, year: 31 } },
	{ id: 2, data: { city: 'Казань', status: 'Открыт', week: -3, month: 8, year: 17 } },
	{ id: 3, data: { city: 'Новосибирск', status: 'На ремонте', week: -9, month: -2, year: 6 } },
]

const trendKeys = ['week', 'month', 'year']

const template = `
	<BaseTable v-bind="args" :columns="columns" :rows="rows">
		<template #header-status="{ column }">{{ column.label }} · статус</template>
		<template #cell-status="{ value }">
			<BaseBadge :label="String(value)" :variant="value === 'Открыт' ? 'soft' : 'outline'" />
		</template>
		<template v-for="key in trendKeys" :key="key" #[\`header-\${key}\`]="{ column }">{{ column.label }}, %</template>
		<template v-for="key in trendKeys" :key="key" #[\`cell-\${key}\`]="{ value }">
			<span :style="{ color: Number(value) < 0 ? 'var(--rise-error-text)' : 'var(--rise-success-text)' }">
				{{ Number(value) > 0 ? '+' : '' }}{{ value }}
			</span>
		</template>
	</BaseTable>
`

export const SlotsByKey: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Слоты по ключу колонки: `header-<key>` — заголовок, `cell-<key>` — ячейки колонки с этим `key`.',
					'Имя слота можно собрать в шаблоне: одинаковые ячейки трёх колонок — один `<template v-for>`',
					'с динамическим именем ``#[`cell-${key}`]``. В ячейку приходят `value`, `row`, `column` и `index`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge', 'BaseTable', 'type TableColumn', 'type TableRow'],
				script: [
					`const columns: TableColumn[] = ${literal(columns)}`,
					`const rows: TableRow[] = ${literal(rows)}`,
					`const trendKeys = ${literal(trendKeys)}`,
				].join('\n'),
				omit: ['columns', 'rows'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable, BaseBadge },
		setup: useStorySetup(args, { data: { columns, rows, trendKeys } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole('columnheader', { name: 'Склад · статус' })).toBeVisible()
		await expect(canvas.getByRole('columnheader', { name: 'За неделю, %' })).toBeVisible()
		await expect(canvas.getByRole('columnheader', { name: 'За год, %' })).toBeVisible()
		const moscow = canvas.getByRole('row', { name: /Москва/ })
		await expect(within(moscow).getByText('+12')).toBeVisible()
		await expect(within(moscow).getByText('Открыт')).toBeVisible()
		const novosibirsk = canvas.getByRole('row', { name: /Новосибирск/ })
		await expect(within(novosibirsk).getByText('-9')).toBeVisible()
	},
}

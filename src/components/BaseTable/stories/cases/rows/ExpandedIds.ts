import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { COLUMNS, ORDERS, toRows, tableScript } from '../../shared'

const template = `
	<div class="story-stack">
		<BaseTable v-bind="args" v-model:expanded-ids="expandedIds" :columns="columns">
			<template #expanded-content="{ row }">Доставка заказа {{ row.data.number }}: курьером до двери.</template>
		</BaseTable>
		<p role="status">Раскрыто строк: {{ expandedIds.length }}</p>
	</div>
`

export const ExpandedIds: StoryObj<typeof meta> = {
	args: { rows: toRows(ORDERS.slice(0, 4), { isExpandable: true }), expandedIds: [2] },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'expandedIds'] },
		docs: {
			description: {
				story: [
					'Раскрытые строки снаружи: `v-model:expandedIds` — массив `id`. Пока проп задан, таблица сама ничего не раскрывает:',
					'клик по строке или кнопке только сообщает новый набор в `update:expandedIds`, а строка раскрывается, когда приложение',
					'вернёт его в проп (так можно запомнить раскрытые строки или раскрыть все). Без пропса набор внутренний, а строка',
					'с `isExpanded: true` раскрыта сразу. У свёрнутой строки нет пустого `<tr>`, у отключённой кнопка раскрытия недоступна.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				models: { expandedIds: 'expandedIds' },
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { models: { expandedIds: 'expandedIds' }, data: { columns: COLUMNS } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const table = canvas.getByRole('table')
		await expect(table.querySelectorAll('tr.base-table__tr--expanded-content')).toHaveLength(1)
		await expect(canvas.getByRole('status')).toHaveTextContent('Раскрыто строк: 1')

		const [first, second] = canvas.getAllByRole('button', { name: /Развернуть строку|Свернуть строку/ })
		await expect(second).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(first)
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Раскрыто строк: 2'))
		await expect(first).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(second)
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Раскрыто строк: 1'))
		await waitFor(() => expect(table.querySelectorAll('tr.base-table__tr--expanded-content')).toHaveLength(1))
	},
}

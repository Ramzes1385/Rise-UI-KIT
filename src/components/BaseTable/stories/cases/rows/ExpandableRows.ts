import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { COLUMNS, toRows, ORDERS, tableScript } from '../../shared'

const template = `
	<BaseTable v-bind="args" :columns="columns">
		<template #expanded-content="{ row }">
			<p style="margin: 0;">Заказ {{ row.data.number }}: 3 позиции, доставка курьером, оплата картой онлайн.</p>
		</template>
	</BaseTable>
`

export const ExpandableRows: StoryObj<typeof meta> = {
	args: {
		rows: [
			...toRows(ORDERS.slice(0, 2), { isExpandable: true }),
			{
				id: 'bundle',
				data: { number: 'З-1040', customer: 'ООО «Вектор»', city: 'Москва', status: 'В пути', date: '2025-05-15', total: 45200 },
				children: [
					{
						id: 'bundle-1',
						data: {
							number: 'З-1040/1',
							customer: 'Склад на Складской',
							city: 'Москва',
							status: 'Доставлен',
							date: '2025-05-15',
							total: 30100,
						},
					},
					{
						id: 'bundle-2',
						data: {
							number: 'З-1040/2',
							customer: 'Офис на Тверской',
							city: 'Москва',
							status: 'В пути',
							date: '2025-05-15',
							total: 15100,
						},
					},
				],
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Раскрытие строк: строка с `isExpandable` показывает под собой слот `expanded-content`, строка с `children` —',
					'дочерние строки с отступом. Кнопка раскрытия сообщает состояние через `aria-expanded`, событие — `expand`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const [expandFirst] = canvas.getAllByRole('button', { name: 'Развернуть строку' })
		await userEvent.click(expandFirst)
		await expect(expandFirst).toHaveAttribute('aria-expanded', 'true')
		await expect(expandFirst).toHaveAccessibleName('Свернуть строку')
		await waitFor(() => expect(canvas.getByText(/Заказ З-1041: 3 позиции/)).toBeVisible())
		await expect(args.onExpand).toHaveBeenLastCalledWith(expect.objectContaining({ id: 1, isExpanded: true }))
	},
}

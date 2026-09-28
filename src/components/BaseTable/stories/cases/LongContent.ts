import { formatRub } from '../shared'
import type meta from '../BaseTable.stories'
import BaseTable from '../../ui/BaseTable.vue'
import { within, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		columns: [
			{ key: 'number', label: 'Заказ' },
			{ key: 'comment', label: 'Комментарий покупателя' },
			{ key: 'total', label: 'Сумма', align: 'right', formatter: formatRub },
		],
		rows: [
			{
				id: 1,
				data: {
					number: 'З-1041',
					comment:
						'Позвонить за час до доставки, домофон не работает: подъезд со стороны двора, третий этаж, дверь направо от лифта',
					total: 12490,
				},
			},
			{ id: 2, data: { number: 'З-1042', comment: 'Оставить у двери', total: 3150 } },
		],
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Длинный текст: в обычной раскладке ячейка переносит строки и растёт по высоте; если у колонок задана ширина',
					'(`width`), раскладка фиксированная и текст обрезается многоточием в одну строку.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			fixedColumns: [
				{ key: 'number', label: 'Заказ', width: '120px' },
				{ key: 'comment', label: 'Комментарий покупателя', width: '320px' },
				{ key: 'total', label: 'Сумма', width: '120px', align: 'right', formatter: formatRub },
			],
		}),
		template: `
			<div class="story-stack">
				<span class="story-label">Ширина по содержимому — перенос строк</span>
				<BaseTable v-bind="props" />
				<span class="story-label">Заданы ширины колонок — многоточие</span>
				<div style="max-width: 560px;">
					<BaseTable v-bind="props" :columns="fixedColumns" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [, fixedTable] = canvas.getAllByRole('table')
		const cell = within(fixedTable).getByRole('cell', { name: /Позвонить за час/ })
		await expect(cell.scrollWidth).toBeGreaterThan(cell.clientWidth)
	},
}

import type meta from '../../BaseTable.stories'
import { waitFor, expect } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { ALL_ROWS, formatDate, formatRub } from '../../shared'

export const StickyHeader: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Закреплённые шапка и колонки: `height` ограничивает высоту — строки прокручиваются под шапкой; `isSticky: 'left'`",
					"и `'right'` закрепляют колонки при горизонтальной прокрутке широкой таблицы. Прокручиваемая область получает",
					'фокус с клавиатуры (Tab), её можно прокрутить стрелками.',
				].join('\n'),
			},
		},
	},
	args: {
		height: '260px',
		rows: ALL_ROWS,
		columns: [
			{ key: 'customer', label: 'Покупатель', width: '180px', isSticky: 'left' },
			{ key: 'number', label: 'Заказ', width: '120px' },
			{ key: 'city', label: 'Город', width: '180px' },
			{ key: 'status', label: 'Статус', width: '140px' },
			{ key: 'date', label: 'Дата', width: '140px', formatter: formatDate },
			{ key: 'progress', label: 'Сборка, %', width: '140px', align: 'right' },
			{ key: 'total', label: 'Сумма', width: '140px', align: 'right', formatter: formatRub, isSticky: 'right' },
		],
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="max-width: 720px;"><BaseTable v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const table = canvas.getByRole('table')
		const scroller = table.parentElement as HTMLElement
		await waitFor(() => expect(scroller).toHaveAttribute('tabindex', '0'))
		scroller.scrollTop = 120
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		await waitFor(() => expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(scroller.getBoundingClientRect().top)))
	},
}

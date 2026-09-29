import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type { TableRow } from '../../../types/BaseTable.types'
import { COMPACT_COLUMNS, bodyRows, ORDERS } from '../../shared'

const MANY_ROWS: TableRow[] = Array.from({ length: 5000 }, (_, index) => {
	const order = ORDERS[index % ORDERS.length]
	return { id: `many-${index}`, data: { ...order, number: `№ ${10000 + index}` } }
})

export const Virtual: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Виртуальная прокрутка (`isVirtual` и `height`): в DOM только видимые строки и запас, остальные — высотой распорок.',
					'Таблица объявляет полное число строк (`aria-rowcount`), строки — своё место (`aria-rowindex`). Высота строки до замера —',
					'`rowHeight`; после отрисовки строки замеряются, раскрытые строки учитываются.',
				].join('\n'),
			},
		},
	},
	args: { height: '360px', rows: MANY_ROWS, columns: COMPACT_COLUMNS, isVirtual: true, features: { rowNumber: true } },
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="max-width: 720px;"><BaseTable v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const table = canvas.getByRole('table')
		await expect(table).toHaveAttribute('aria-rowcount', '5001')
		await expect(bodyRows(table).length).toBeLessThan(40)
		const scroller = table.parentElement as HTMLElement
		scroller.scrollTop = scroller.scrollHeight
		await waitFor(() => expect(canvas.getByText('№ 14999')).toBeVisible())
		await expect(canvas.getByText('№ 14999').closest('tr')).toHaveAttribute('aria-rowindex', '5001')
	},
}

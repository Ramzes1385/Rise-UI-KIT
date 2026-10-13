import { ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseTable.stories'
import BaseTable from '../../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import { ALL_ROWS, COMPACT_COLUMNS, ORDERS, bodyRows, tableScript } from '../../../shared'

const template = `
	<div class="story-stack">
		<BaseTable
			v-model:page="page"
			:columns="columns"
			:rows="rows.slice((page - 1) * 4, page * 4)"
			:total-rows="rows.length"
			:page-size="4" />
		<p role="status">Запрошена страница {{ page }}: строки с {{ (page - 1) * 4 + 1 }} по {{ page * 4 }}</p>
	</div>
`

const script = `
${tableScript({ columns: COMPACT_COLUMNS }, { orders: ORDERS })}
const rows: TableRow[] = orders.map(order => ({ id: order.id, data: { ...order } }))
const page = ref(1)
`

export const ServerTotalRows: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Серверная пагинация: `rows` содержит только текущую страницу, а `totalRows` — сколько строк всего на сервере. Число',
					'страниц, подпись «5–8 из 12» и пагинация считаются по `totalRows`, строки страницы не нарезаются по `pageSize`.',
					'Приложение следит за `v-model:page` и запрашивает нужную страницу. В режимах `button` и `infinite` `totalRows`',
					'удерживает кнопку «Загрузить еще» и подгрузку прокруткой, пока в `rows` строк меньше.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseTable', 'type TableColumn', 'type TableRow'],
				vue: ['ref'],
				script,
			}),
		},
	},
	render: () => ({
		components: { BaseTable },
		setup: () => ({ columns: COMPACT_COLUMNS, rows: ALL_ROWS, page: ref(1) }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const table = canvas.getByRole('table')
		await expect(bodyRows(table)).toHaveLength(4)
		await expect(canvas.getByText('1–4 из 12')).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: 'Страница 3' }))
		await waitFor(() => expect(canvas.getByText('9–12 из 12')).toBeVisible())
		await expect(bodyRows(table)).toHaveLength(4)
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1049')

		const previous = canvas.getByRole('button', { name: 'Предыдущая страница' })
		previous.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText('5–8 из 12')).toBeVisible())
		await expect(canvas.getByRole('status')).toHaveTextContent('Запрошена страница 2: строки с 5 по 8')
	},
}

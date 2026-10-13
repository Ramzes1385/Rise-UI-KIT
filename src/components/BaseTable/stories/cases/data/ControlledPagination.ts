import { ref } from 'vue'
import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import { ALL_ROWS, COMPACT_COLUMNS, ORDERS, bodyRows, tableScript } from '../../shared'

const template = `
	<div class="story-stack">
		<BaseTable v-model:page="page" v-model:page-size="pageSize" :columns="columns" :rows="rows" />
		<div class="story-row">
			<BaseButton variant="outline" @click="page = 1">К первой странице</BaseButton>
			<BaseButton variant="outline" @click="page = 3">К третьей странице</BaseButton>
			<p role="status">Страница {{ page }}, по {{ pageSize }} строки</p>
		</div>
	</div>
`

const script = `
${tableScript({ columns: COMPACT_COLUMNS }, { orders: ORDERS })}
const rows: TableRow[] = orders.map(order => ({ id: order.id, data: { ...order } }))
const page = ref(2)
const pageSize = ref(4)
`

export const ControlledPagination: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Страница и её размер снаружи: `v-model:page` и `v-model:pageSize`. Пока проп `page` задан, таблица сама страницу не меняет —',
					'клик по пагинации, сброс поиском или фильтром и сдвиг на последнюю существующую страницу сообщают номер в `update:page`,',
					'а страницей остаётся значение пропса. Так страницу можно хранить в адресной строке, переключать своими кнопками и',
					'восстанавливать после перезагрузки. Без пропса страница внутренняя.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseTable', 'BaseButton', 'type TableColumn', 'type TableRow'],
				vue: ['ref'],
				script,
			}),
		},
	},
	render: () => ({
		components: { BaseTable, BaseButton },
		setup: () => ({ columns: COMPACT_COLUMNS, rows: ALL_ROWS, page: ref(2), pageSize: ref(4) }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const table = canvas.getByRole('table')
		await expect(canvas.getByRole('status')).toHaveTextContent('Страница 2, по 4 строки')
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1045')

		await userEvent.click(canvas.getByRole('button', { name: 'Страница 3' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Страница 3'))
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1049')

		const first = canvas.getByRole('button', { name: 'К первой странице' })
		first.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Страница 1'))
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1041')
	},
}

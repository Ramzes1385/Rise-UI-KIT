import { computed, ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseTable.stories'
import BaseTable from '../../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import type { SortState } from '../../../../types/BaseTable.types'
import { COMPACT_COLUMNS, ORDERS, bodyRows, tableScript } from '../../../shared'

const PAGE_SIZE = 4

const template = `
	<div class="story-stack">
		<BaseTable
			v-model:page="page"
			:columns="columns"
			:rows="rows"
			:total-rows="total"
			:page-size="4"
			:features="{ search: true }"
			:search-debounce="0"
			is-manual-filtering
			is-manual-sorting
			@search="query = $event"
			@sort="sort = $event" />
		<p role="status">Запрос к серверу: {{ request }}</p>
	</div>
`

const script = `
${tableScript({ columns: COMPACT_COLUMNS }, { orders: ORDERS })}
const PAGE_SIZE = 4
const query = ref('')
const sort = ref<SortState[]>([])
const page = ref(1)

const found = computed(() => {
	const needle = query.value.trim().toLowerCase()
	const list = orders.filter(order => order.customer.toLowerCase().includes(needle))
	const [state] = sort.value
	if (!state?.direction) return list
	const sign = state.direction === 'asc' ? 1 : -1
	const compare = (a: (typeof orders)[number], b: (typeof orders)[number]) =>
		state.key === 'total' ? a.total - b.total : a.customer.localeCompare(b.customer, 'ru')
	return [...list].sort((a, b) => sign * compare(a, b))
})
const total = computed(() => found.value.length)
const rows = computed(() =>
	found.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE).map(order => ({ id: order.id, data: { ...order } })),
)
const request = computed(() => {
	const [state] = sort.value
	const order = state?.direction ? state.key + ' ' + state.direction : 'нет'
	return 'поиск «' + query.value + '», сортировка ' + order + ', страница ' + page.value
})
`

export const ServerSide: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Серверный режим: `isManualFiltering` и `isManualSorting`. Таблица не применяет поиск, фильтры и сортировку к',
					'переданной странице, а только сообщает события `search`, `filter`, `sort`; приложение отправляет запрос и присылает',
					'готовую страницу в `rows` вместе с `totalRows`. В примере «сервер» — вычисляемое значение на тех же заказах:',
					'строка «Запрос к серверу» показывает, что ушло в запрос. Поиск сбрасывает страницу на первую (`v-model:page`),',
					'стрелка и `aria-sort` в шапке работают как обычно. Пустая страница при активном поиске показывает «Ничего не найдено».',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseTable', 'type SortState', 'type TableColumn'],
				vue: ['computed', 'ref'],
				script,
			}),
		},
	},
	render: () => ({
		components: { BaseTable },
		setup: () => {
			const query = ref('')
			const sort = ref<SortState[]>([])
			const page = ref(1)
			type Order = (typeof ORDERS)[number]
			const found = computed(() => {
				const needle = query.value.trim().toLowerCase()
				const list = ORDERS.filter(order => order.customer.toLowerCase().includes(needle))
				const [state] = sort.value
				if (!state?.direction) return list
				const sign = state.direction === 'asc' ? 1 : -1
				const compare = (a: Order, b: Order) =>
					state.key === 'total' ? a.total - b.total : a.customer.localeCompare(b.customer, 'ru')
				return [...list].sort((a, b) => sign * compare(a, b))
			})
			const total = computed(() => found.value.length)
			const rows = computed(() =>
				found.value
					.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
					.map(order => ({ id: order.id, data: { ...order } })),
			)
			const request = computed(() => {
				const [state] = sort.value
				const order = state?.direction ? state.key + ' ' + state.direction : 'нет'
				return 'поиск «' + query.value + '», сортировка ' + order + ', страница ' + page.value
			})
			return { columns: COMPACT_COLUMNS, query, sort, page, total, rows, request }
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const table = canvas.getByRole('table')
		await expect(bodyRows(table)).toHaveLength(4)
		await expect(canvas.getByRole('status')).toHaveTextContent('Запрос к серверу: поиск «», сортировка нет, страница 1')

		const search = canvas.getByLabelText('Поиск по таблице')
		await userEvent.type(search, 'Орлов')
		await waitFor(() => expect(bodyRows(table)).toHaveLength(1))
		await expect(canvas.getByRole('status')).toHaveTextContent('поиск «Орлов»')
		await expect(bodyRows(table)[0]).toHaveTextContent('Дмитрий Орлов')

		await userEvent.clear(search)
		await waitFor(() => expect(bodyRows(table)).toHaveLength(4))
		const sortButton = canvas.getByRole('button', { name: 'Сумма' })
		sortButton.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('сортировка total asc'))
		await expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'ascending')
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1044')

		await userEvent.click(canvas.getByRole('button', { name: 'Страница 2' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('страница 2'))
		await expect(bodyRows(table)[0]).toHaveTextContent('З-1049')

		await userEvent.type(search, 'ъъъ')
		await waitFor(() => expect(canvas.getByText('Ничего не найдено')).toBeVisible())
	},
}

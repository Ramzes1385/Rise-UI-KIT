import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TableRow } from '../../../types/BaseTable.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { COMPACT_COLUMNS, ORDERS, bodyRows, tableScript } from '../../shared'

const TOTAL = 90
const PAGE_SIZE = 30

const MANY_ROWS: TableRow[] = Array.from({ length: TOTAL }, (_, index) => {
	const order = ORDERS[index % ORDERS.length]
	return { id: `many-${index}`, data: { ...order, number: `№ ${10000 + index}` } }
})

const template = `
	<BaseTable v-bind="args" :columns="columns" :rows="rows" load-mode="infinite" :page-size="${PAGE_SIZE}" />
`

const script = [
	tableScript({ columns: COMPACT_COLUMNS }),
	`const orders = ${literal(ORDERS)}`,
	[
		`const rows: TableRow[] = Array.from({ length: ${TOTAL} }, (_, index) => {`,
		'\tconst order = orders[index % orders.length]',
		'\treturn { id: `many-${index}`, data: { ...order, number: `№ ${10000 + index}` } }',
		'})',
	].join('\n'),
].join('\n\n')

export const InfiniteWithoutHeight: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Подгрузка прокруткой без `height`: прокручивается страница, а не обёртка таблицы. Под строками стоит невидимая метка,',
					'за ней следит IntersectionObserver: когда метка подходит к краю окна ближе чем на 50px, приходит `load-more` и показывается',
					'следующая порция (`pageSize` строк). Если первая порция не заполняет окно, подгрузка продолжается сама.',
					'С `height` корнем наблюдателя становится обёртка. На сервере и без IntersectionObserver таблица, как и раньше,',
					'слушает прокрутку обёртки.',
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
		setup: useStorySetup(args, { data: { columns: COMPACT_COLUMNS, rows: MANY_ROWS } }),
		template,
	}),
	play: async ({ canvas, args }) => {
		const table = canvas.getByRole('table')
		await expect(bodyRows(table)).toHaveLength(PAGE_SIZE)

		window.scrollTo(0, document.documentElement.scrollHeight)
		await waitFor(() => expect(bodyRows(table).length).toBeGreaterThan(PAGE_SIZE))
		await expect(args['onLoad-more']).toHaveBeenCalled()
	},
}

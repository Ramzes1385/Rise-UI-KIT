import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ALL_ROWS, COMPACT_COLUMNS, bodyRows, tableScript } from '../../shared'

const columns = COMPACT_COLUMNS

const template = `
	<div class="story-stack">
		<span class="story-label">loadMode: button</span>
		<BaseTable v-bind="args" :columns="columns" load-mode="button" />
		<span class="story-label">loadMode: infinite, height: 180px</span>
		<BaseTable v-bind="args" :columns="columns" load-mode="infinite" height="180px" />
	</div>
`

export const LoadMore: StoryObj<typeof meta> = {
	args: { rows: ALL_ROWS, pageSize: 4 },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'pageSize'] },
		docs: {
			description: {
				story: [
					'Подгрузка вместо страниц: `loadMode="button"` — кнопка «Загрузить еще» под таблицей, `loadMode="infinite"` —',
					'следующая порция при прокрутке до конца (нужна высота `height`). Каждая порция — `pageSize` строк, событие `load-more`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTable', 'type TableColumn'], script: tableScript({ columns }) }),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const [buttonTable, infiniteTable] = canvas.getAllByRole('table')
		await expect(bodyRows(buttonTable)).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await expect(bodyRows(buttonTable)).toHaveLength(8)
		await expect(args['onLoad-more']).toHaveBeenCalledOnce()

		const scroller = infiniteTable.parentElement as HTMLElement
		await expect(bodyRows(infiniteTable)).toHaveLength(4)
		scroller.scrollTop = scroller.scrollHeight
		await waitFor(() => expect(bodyRows(infiniteTable)).toHaveLength(8))
	},
}

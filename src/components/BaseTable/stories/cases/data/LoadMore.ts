import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { ALL_ROWS, COMPACT_COLUMNS, bodyRows } from '../../shared'

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
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows" :page-size="4" load-mode="button" />',
					'<BaseTable :columns="columns" :rows="rows" :page-size="4" load-mode="infinite" height="180px" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), columns: COMPACT_COLUMNS }),
		template: `
			<div class="story-stack">
				<span class="story-label">loadMode: button</span>
				<BaseTable v-bind="props" :columns="columns" load-mode="button" />
				<span class="story-label">loadMode: infinite, height: 180px</span>
				<BaseTable v-bind="props" :columns="columns" load-mode="infinite" height="180px" />
			</div>
		`,
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

import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { COLUMNS, toRows, ORDERS, tableScript } from '../../shared'

const rows = toRows(ORDERS.slice(0, 3))

const template = `
	<div class="story-stack">
		<span class="story-label">Первая загрузка — скелетон</span>
		<BaseTable v-bind="args" :columns="columns" :rows="[]" :page-size="3" />
		<span class="story-label">Обновление — подложка поверх данных</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" />
	</div>
`

export const Loading: StoryObj<typeof meta> = {
	args: { isLoading: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'behavior', 'features'] },
		docs: {
			description: {
				story: [
					'Загрузка: без данных — строки-скелетоны (их число — `pageSize` или 5), с данными — подложка со спиннером поверх строк,',
					'строки недоступны для клика. Таблица помечена `aria-busy`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }, { rows }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: args.columns, rows }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const table of canvas.getAllByRole('table')) {
			await expect(table).toHaveAttribute('aria-busy', 'true')
		}
		await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
	},
}

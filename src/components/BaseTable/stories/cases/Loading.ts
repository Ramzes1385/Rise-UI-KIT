import { expect } from 'storybook/test'
import { toRows, ORDERS } from '../shared'
import type meta from '../BaseTable.stories'
import BaseTable from '../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="[]" is-loading />',
					'<BaseTable :columns="columns" :rows="rows" is-loading />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), rows: toRows(ORDERS.slice(0, 3)) }),
		template: `
			<div class="story-stack">
				<span class="story-label">Первая загрузка — скелетон</span>
				<BaseTable v-bind="props" :rows="[]" :page-size="3" />
				<span class="story-label">Обновление — подложка поверх данных</span>
				<BaseTable v-bind="props" :rows="rows" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const table of canvas.getAllByRole('table')) {
			await expect(table).toHaveAttribute('aria-busy', 'true')
		}
		await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
	},
}

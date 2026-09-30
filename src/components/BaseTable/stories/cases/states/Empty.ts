import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import { COLUMNS, tableScript } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseTable v-bind="args" :columns="columns" />
		<BaseTable v-bind="args" :columns="columns">
			<template #empty>
				<BaseEmpty variant="ghost" icon="search" title="Ничего не найдено" description="Измените условия поиска">
					<template #actions><BaseButton variant="outline">Сбросить фильтры</BaseButton></template>
				</BaseEmpty>
			</template>
		</BaseTable>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { rows: [], emptyText: 'Заказов пока нет' },
	parameters: {
		docs: {
			description: {
				story: [
					'Пустая таблица показывает `BaseEmpty` с текстом `emptyText`. Слот `empty` заменяет его своим содержимым —',
					'например, пустым состоянием поиска с кнопкой сброса.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseEmpty', 'BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable, BaseEmpty, BaseButton },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Заказов пока нет' })).toBeVisible()
		await expect(canvas.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Сбросить фильтры' })).toBeVisible()
	},
}

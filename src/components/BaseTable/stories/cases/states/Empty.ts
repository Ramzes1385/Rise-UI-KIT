import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="[]" empty-text="Заказов пока нет" />',
					'<BaseTable :columns="columns" :rows="[]">',
					'  <template #empty>',
					'    <BaseEmpty variant="ghost" icon="search" title="Ничего не найдено" description="Измените условия поиска">',
					'      <template #actions><BaseButton variant="outline">Сбросить фильтры</BaseButton></template>',
					'    </BaseEmpty>',
					'  </template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseEmpty, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-stack">
				<BaseTable v-bind="props" />
				<BaseTable v-bind="props">
					<template #empty>
						<BaseEmpty variant="ghost" icon="search" title="Ничего не найдено" description="Измените условия поиска">
							<template #actions><BaseButton variant="outline">Сбросить фильтры</BaseButton></template>
						</BaseEmpty>
					</template>
				</BaseTable>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Заказов пока нет' })).toBeVisible()
		await expect(canvas.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Сбросить фильтры' })).toBeVisible()
	},
}

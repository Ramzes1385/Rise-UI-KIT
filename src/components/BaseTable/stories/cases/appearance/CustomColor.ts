import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { COMPACT_COLUMNS, toRows, ORDERS } from '../../shared'

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		columns: [...COMPACT_COLUMNS, { key: 'actions', label: 'Действия', align: 'right' }],
		rows: toRows(ORDERS.slice(0, 3)),
		color: { bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#4c1d95' } },
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон таблицы, `bg.hover` — строка под курсором, `text.base` — текст шапки',
					'и ячеек. Кнопки, бейджи и поля внутри таблицы цвет не наследуют.',
				].join('\n'),
			},
			source: {
				code: [
					`<BaseTable :columns="columns" :rows="rows" :color="{ bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#4c1d95' } }">`,
					'  <template #cell-actions><BaseButton variant="outline">Открыть</BaseButton></template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #cell-actions="{ row }">
					<BaseButton variant="outline" :aria-label="'Открыть заказ ' + row.data.number" @click.stop>Открыть</BaseButton>
				</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvasElement, canvas }) => {
		const body = canvasElement.querySelector('.base-table__body') as HTMLElement
		await expect(getComputedStyle(body).backgroundColor).toBe('rgb(245, 243, 255)')
		const button = canvas.getByRole('button', { name: 'Открыть заказ З-1041' })
		await expect(getComputedStyle(button).getPropertyValue('--custom-bg')).toBe('')
		await expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(245, 243, 255)')
	},
}

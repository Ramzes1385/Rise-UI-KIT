import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseTable from '../../../ui/BaseTable.vue'
import { BaseBadge } from '@components/BaseBadge'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseProgress } from '@components/BaseProgress'
import { formatRub, toRows, ORDERS, tableScript } from '../../shared'
import type { TableColumn, TableRow } from '../../../types/BaseTable.types'
import { avatarImage, literal, storySource, useStorySetup } from '@/stories/helpers'

const STATUS_COLORS: Record<string, { bg: { base: string }; text: { base: string } }> = {
	Доставлен: { bg: { base: 'var(--rise-success-soft)' }, text: { base: 'var(--rise-success-text)' } },
	'В пути': { bg: { base: 'var(--rise-info-soft)' }, text: { base: 'var(--rise-info-text)' } },
	Оплачен: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	Отменён: { bg: { base: 'var(--rise-error-soft)' }, text: { base: 'var(--rise-error-text)' } },
}

const columns: TableColumn[] = [
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'status', label: 'Статус' },
	{ key: 'progress', label: 'Сборка' },
	{ key: 'total', label: 'Сумма', align: 'right', formatter: formatRub },
	{ key: 'actions', label: 'Действия', align: 'right' },
]

const initialRows = (): TableRow[] =>
	toRows(ORDERS.slice(0, 4)).map((row, index) => ({ ...row, data: { ...row.data, avatar: avatarImage(24 + index * 70) } }))

const template = `
	<BaseTable v-bind="args" :columns="columns" :rows="rows">
		<template #header>
			<div style="display: flex; flex-direction: column; gap: 2px;">
				<strong style="color: var(--rise-text-highlighted);">Заказы за май</strong>
				<span style="color: var(--rise-text-muted);">Последние заказы интернет-магазина</span>
			</div>
		</template>
		<template #header-total>Сумма, ₽</template>
		<template #cell-customer="{ row }">
			<div style="display: flex; align-items: center; gap: 12px;">
				<BaseAvatar :src="row.data.avatar" :alt="row.data.customer" :name="row.data.customer" />
				<div style="display: flex; flex-direction: column;">
					<span style="color: var(--rise-text-highlighted); font-weight: var(--rise-font-weight-medium);">{{ row.data.customer }}</span>
					<span style="color: var(--rise-text-muted);">{{ row.data.number }} · {{ row.data.city }}</span>
				</div>
			</div>
		</template>
		<template #cell-status="{ value }">
			<BaseBadge :label="value" :color="statusColors[value]" />
		</template>
		<template #cell-progress="{ value }">
			<div style="min-width: 120px;">
				<BaseProgress :value="value" :aria-label="'Сборка заказа: ' + value + '%'" />
			</div>
		</template>
		<template #cell-actions="{ row }">
			<BaseButton variant="ghost" :padding="{ x: 5, y: 5 }" :aria-label="'Удалить заказ ' + row.data.number" @click.stop="remove(row.id)">
				<BaseIcon name="trash" />
			</BaseButton>
		</template>
		<template #footer>
			<span>Заказов: {{ rows.length }} · на сумму {{ total() }}</span>
		</template>
	</BaseTable>
`

const script = [
	tableScript({ columns }, { statusColors: STATUS_COLORS }),
	[
		`const rows = ref<TableRow[]>(${literal(initialRows())})`,
		'const total = () => formatRub(rows.value.reduce((sum, row) => sum + Number(row.data.total), 0))',
		'const remove = (id: string | number) => {',
		'\trows.value = rows.value.filter(row => row.id !== id)',
		'}',
	].join('\n'),
].join('\n\n')

export const CustomCells: StoryObj<typeof meta> = {
	args: {
		columns,
	},
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Свои ячейки и секции: слоты `cell-<key>` (аватар, бейдж статуса, прогресс, кнопка действия) и `header-<key>`,',
					'а также `header` и `footer` над и под таблицей. Кнопка в ячейке не должна запускать клик по строке — `@click.stop`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [
					'BaseAvatar',
					'BaseBadge',
					'BaseButton',
					'BaseIcon',
					'BaseProgress',
					'BaseTable',
					'type TableColumn',
					'type TableRow',
				],
				vue: ['ref'],
				script,
				omit: ['columns', 'rows'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable, BaseAvatar, BaseBadge, BaseButton, BaseIcon, BaseProgress },
		setup: useStorySetup(args, {
			data: { columns: args.columns, statusColors: STATUS_COLORS },
			slots: ['default', 'columns', 'rows'],
			setup: () => {
				const rows = ref<TableRow[]>(initialRows())
				const total = () => formatRub(rows.value.reduce((sum, row) => sum + Number(row.data.total), 0))
				const remove = (id: string | number) => {
					rows.value = rows.value.filter(row => row.id !== id)
				}
				return { rows, total, remove }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByText('Заказов: 4', { exact: false })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить заказ З-1042' }))
		await expect(canvas.queryByText('Иван Петров')).not.toBeInTheDocument()
		await expect(canvas.getByText('Заказов: 3', { exact: false })).toBeVisible()
		await expect(args['onRow-click']).not.toHaveBeenCalled()
	},
}

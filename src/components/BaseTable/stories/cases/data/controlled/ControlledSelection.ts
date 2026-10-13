import { ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseTable.stories'
import { BaseButton } from '@components/BaseButton'
import BaseTable from '../../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import type { BaseTableExpose } from '../../../../types/BaseTable.types'
import { ALL_ROWS, COMPACT_COLUMNS, ORDERS, tableScript } from '../../../shared'

const template = `
	<div class="story-stack">
		<BaseTable ref="table" v-model:selected-ids="selectedIds" :columns="columns" :rows="rows" :behavior="{ selectable: true }" />
		<div class="story-row">
			<BaseButton variant="outline" @click="selectedIds = [1, 2]">Выбрать два заказа</BaseButton>
			<BaseButton variant="outline" @click="table?.clearSelection()">Снять выбор</BaseButton>
			<p role="status">Выбрано заказов: {{ selectedIds.length }}</p>
		</div>
	</div>
`

const script = `
${tableScript({ columns: COMPACT_COLUMNS }, { orders: ORDERS.slice(0, 5) })}
const rows: TableRow[] = orders.map(order => ({ id: order.id, data: { ...order } }))
const table = ref<BaseTableExpose | null>(null)
const selectedIds = ref<Array<string | number>>([3])
`

export const ControlledSelection: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Выбор снаружи: `v-model:selectedIds` — массив `id`. Пока проп задан, чекбоксы только сообщают новый набор в',
					'`update:selectedIds` (и `select`), а строка отмечается, когда приложение вернёт его в проп; `isSelected` строк при этом',
					'не учитывается. Выбор живёт в приложении: его можно задать кнопкой, сохранить между страницами серверной пагинации',
					'(`id` строк, которых нет в `rows`, сохраняются) и снять методом `clearSelection()` через `ref` — он работает и при',
					'внутреннем выборе. Без пропса выбор внутренний и стартует с `isSelected` строк.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseTable', 'BaseButton', 'type TableColumn', 'type TableRow', 'type BaseTableExpose'],
				vue: ['ref'],
				script,
			}),
		},
	},
	render: () => ({
		components: { BaseTable, BaseButton },
		setup: () => ({
			columns: COMPACT_COLUMNS,
			rows: ALL_ROWS.slice(0, 5),
			table: ref<BaseTableExpose | null>(null),
			selectedIds: ref<Array<string | number>>([3]),
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('status')).toHaveTextContent('Выбрано заказов: 1')
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 3' })).toBeChecked()

		await userEvent.click(canvas.getByRole('checkbox', { name: 'Выбрать строку 1' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Выбрано заказов: 2'))
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 1' })).toBeChecked()

		const set = canvas.getByRole('button', { name: 'Выбрать два заказа' })
		set.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 2' })).toBeChecked())
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 3' })).not.toBeChecked()

		const clear = canvas.getByRole('button', { name: 'Снять выбор' })
		clear.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Выбрано заказов: 0'))
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 1' })).not.toBeChecked()
	},
}

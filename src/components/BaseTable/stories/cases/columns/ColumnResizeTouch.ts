import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { TableColumn } from '../../../types/BaseTable.types'
import { COLUMNS, ORDERS, tableScript, toRows } from '../../shared'

const template = `
	<BaseTable v-bind="args" :columns="columns" />
`

const columns: TableColumn[] = COLUMNS.map(column =>
	column.key === 'number' ? { ...column, width: '160px', minWidth: '120px', maxWidth: '240px' } : column,
)

export const ColumnResizeTouch: StoryObj<typeof meta> = {
	args: { rows: toRows(ORDERS.slice(0, 4)), behavior: { resizable: true } },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'behavior'] },
		docs: {
			description: {
				story: [
					'Ширина колонки указателем: ручка работает на pointer events — мышью, пальцем и пером. Ручка захватывает указатель',
					'(`setPointerCapture`) и не даёт странице прокручиваться (`touch-action: none`); на устройствах с грубым указателем',
					'область нажатия шире (24px). Второй палец и правая кнопка мыши жест не начинают, `pointercancel` прерывает его',
					'и возвращает колонкам прежнюю ширину. Движения за кадр сливаются в одно (`requestAnimationFrame`). Границы колонки — `minWidth` и `maxWidth`',
					'в px: здесь «Заказ» нельзя сделать уже 120px и шире 240px, остаток забирает соседняя колонка.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns }),
				omit: ['columns'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		const handle = header.querySelector('.base-table__resizer') as HTMLElement
		await expect(getComputedStyle(handle).touchAction).toBe('none')

		const rect = handle.getBoundingClientRect()
		const x = rect.left + rect.width / 2
		const y = rect.top + rect.height / 2
		const at = (offset: number) => ({ clientX: x + offset, clientY: y, pageX: x + offset, pageY: y })
		await userEvent.pointer([
			{ keys: '[TouchA>]', target: handle, coords: at(0) },
			{ pointerName: 'TouchA', target: handle, coords: at(400) },
			{ keys: '[/TouchA]', target: handle },
		])
		await expect(args['onColumn-resize']).toHaveBeenLastCalledWith('number', 240)
		await expect(Math.round(header.getBoundingClientRect().width)).toBe(240)

		const moved = handle.getBoundingClientRect()
		const startX = moved.left + moved.width / 2
		const shift = (offset: number) => ({ clientX: startX + offset, clientY: y, pageX: startX + offset, pageY: y })
		await userEvent.pointer([
			{ keys: '[TouchA>]', target: handle, coords: shift(0) },
			{ pointerName: 'TouchA', target: handle, coords: shift(-400) },
			{ keys: '[/TouchA]', target: handle },
		])
		await expect(args['onColumn-resize']).toHaveBeenLastCalledWith('number', 120)
		await expect(Math.round(header.getBoundingClientRect().width)).toBe(120)
	},
}

import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { COLUMNS, toRows, ORDERS, tableScript } from '../../shared'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTable v-bind="args" :columns="columns">
		<template #expanded-content="{ row }">Доставка заказа {{ row.data.number }}: курьером до двери.</template>
	</BaseTable>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус на кнопку сортировки (кольцо фокуса), Enter и Space меняют направление (`aria-sort`);',
					'Space отмечает чекбокс строки; Enter на кнопке раскрытия показывает содержимое строки. Со слушателем `row-click`',
					'строки — одна точка Tab: ↑/↓, Home и End переходят между строками, Enter и Space дают `row-click`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns: COLUMNS }),
				omit: ['columns'],
			}),
		},
	},
	tags: ['!autodocs'],
	args: {
		rows: toRows(ORDERS.slice(0, 3), { isExpandable: true }),
		behavior: { selectable: true },
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const sortButton = canvas.getByRole('button', { name: 'Покупатель' })
		const header = canvas.getByRole('columnheader', { name: 'Покупатель' })
		await tabTo(sortButton, userEvent)
		await expect(getComputedStyle(sortButton).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(header).toHaveAttribute('aria-sort', 'ascending')
		await userEvent.keyboard(' ')
		await expect(header).toHaveAttribute('aria-sort', 'descending')

		const rowCheckbox = canvas.getByRole('checkbox', { name: 'Выбрать строку 1' })
		await tabTo(rowCheckbox, userEvent)
		await userEvent.keyboard(' ')
		await expect(rowCheckbox).toBeChecked()

		const [expandButton] = canvas.getAllByRole('button', { name: 'Развернуть строку' })
		await tabTo(expandButton, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(expandButton).toHaveAttribute('aria-expanded', 'true')

		const rows = canvas.getAllByRole('row').filter(row => row.hasAttribute('data-row-interactive'))
		rows[0].focus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(rows[1]).toHaveFocus()
		await expect(rows[1]).toHaveAttribute('tabindex', '0')
		await userEvent.keyboard('{Enter}')
		await expect(args['onRow-click']).toHaveBeenLastCalledWith(expect.objectContaining({ id: 2 }))
	},
}

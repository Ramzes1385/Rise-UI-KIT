import { expect } from 'storybook/test'
import { toRows, ORDERS } from '../../shared'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус на кнопку сортировки (кольцо фокуса), Enter и Space меняют направление (`aria-sort`);',
					'Space отмечает чекбокс строки; Enter на кнопке раскрытия показывает содержимое строки.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: {
		rows: toRows(ORDERS.slice(0, 3), { isExpandable: true }),
		behavior: { selectable: true },
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #expanded-content="{ row }">Доставка заказа {{ row.data.number }}: курьером до двери.</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
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
	},
}

import type meta from '../../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { toRows, ORDERS, bodyRows } from '../../shared'

export const Selection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выбор строк (`behavior.selectable`): чекбоксы в строках и «Выбрать все» в шапке, выбранная строка подсвечена.',
					'Отключённую строку (`isDisabled`) выбрать нельзя. При поиске «Выбрать все» отмечает только найденные строки,',
					'а событие `select` получает выбранные строки целиком. Когда выбрана часть строк, «Выбрать все» в частичном',
					'состоянии (черта, `indeterminate`). Поиск без совпадений показывает «Ничего не найдено» (`emptyFilteredText`).',
				].join('\n'),
			},
		},
	},
	args: {
		rows: toRows(ORDERS.slice(0, 8)).map(row => (row.id === 4 ? { ...row, isDisabled: true } : row)),
		behavior: { selectable: true },
		features: { search: true },
		searchDebounce: 0,
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 4' })).toBeDisabled()
		const firstRow = canvas.getByRole('checkbox', { name: 'Выбрать строку 1' })
		await userEvent.click(firstRow)
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать все строки' })).toHaveProperty('indeterminate', true)
		await userEvent.click(firstRow)
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать все строки' })).toHaveProperty('indeterminate', false)
		await userEvent.type(canvas.getByLabelText('Поиск по таблице'), 'Казань')
		await waitFor(() => expect(bodyRows(canvas.getByRole('table'))).toHaveLength(2))
		const selectAll = canvas.getByRole('checkbox', { name: 'Выбрать все строки' })
		await userEvent.click(selectAll)
		await expect(selectAll).toBeChecked()
		await expect(args.onSelect).toHaveBeenLastCalledWith([expect.objectContaining({ id: 2 }), expect.objectContaining({ id: 8 })])
		await userEvent.type(canvas.getByLabelText('Поиск по таблице'), 'ъъъ')
		await waitFor(() => expect(canvas.getByText('Ничего не найдено')).toBeVisible())
	},
}

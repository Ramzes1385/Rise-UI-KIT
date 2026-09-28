import { expect } from 'storybook/test'
import type meta from '../BaseTable.stories'
import { toRows, ORDERS, bodyRows } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Sorting: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сортировка: клик по заголовку — по возрастанию, повторный — по убыванию, третий — сброс. С `behavior.multiSort`',
					'колонки добавляются к сортировке по очереди, номер у иконки — приоритет (озвучивается как описание кнопки).',
					'Пустые значения всегда в конце, числа и даты сравниваются как числа и даты.',
				].join('\n'),
			},
		},
	},
	args: { rows: toRows(ORDERS.slice(0, 8)), behavior: { multiSort: true } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Город' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Сумма' }))
		await expect(canvas.getByRole('columnheader', { name: 'Город' })).toHaveAttribute('aria-sort', 'ascending')
		await expect(canvas.getByRole('columnheader', { name: 'Сумма' })).toHaveAttribute('aria-sort', 'ascending')
		await expect(canvas.getByRole('button', { name: 'Сумма' })).toHaveAccessibleDescription('Приоритет сортировки: 2')
		await expect(args.onSort).toHaveBeenLastCalledWith([
			{ key: 'city', direction: 'asc' },
			{ key: 'total', direction: 'asc' },
		])
		const [first, second, third] = bodyRows(canvas.getByRole('table'))
		await expect(first).toHaveTextContent('Екатерина Волкова')
		await expect(second).toHaveTextContent('Иван Петров')
		await expect(third).toHaveTextContent('Сергей Новиков')
	},
}

import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { toRows, ORDERS, bodyRows } from '../../shared'

export const Pagination: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пагинация: `pageSize` строк на странице, под таблицей — «1–3 из 8» и `BasePagination`. `features.pageSizeSelector`',
					'с `pageSizeOptions` добавляет выбор размера страницы. Смена страницы вызывает `page-change`.',
				].join('\n'),
			},
		},
	},
	args: {
		rows: toRows(ORDERS.slice(0, 8)),
		pageSize: 3,
		pageSizeOptions: [3, 5, 8],
		features: { pageSizeSelector: true },
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByText('1–3 из 8')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: '2' }))
		await expect(canvas.getByText('4–6 из 8')).toBeVisible()
		await expect(bodyRows(canvas.getByRole('table'))[0]).toHaveTextContent('З-1044')
		await expect(args['onPage-change']).toHaveBeenLastCalledWith(2)
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущая страница' }))
		await expect(canvas.getByText('1–3 из 8')).toBeVisible()
	},
}

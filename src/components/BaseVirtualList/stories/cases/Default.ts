import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseVirtualList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: '10 000 заказов: в DOM около двадцати строк. Прокрутите в конец — отрисуются последние.' } },
	},
	play: async ({ canvas }) => {
		const list = canvas.getByRole('list', { name: 'Заказы' })
		const rows = canvas.getAllByRole('listitem')
		await expect(rows.length).toBeLessThan(30)
		await expect(rows[0]).toHaveAttribute('aria-setsize', '10000')
		list.scrollTop = list.scrollHeight
		await waitFor(() => expect(canvas.getByText('Заказ № 10999')).toBeVisible())
	},
}

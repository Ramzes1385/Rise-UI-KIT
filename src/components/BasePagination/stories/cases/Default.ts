import { expect, waitFor } from 'storybook/test'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: клик по номеру или стрелке меняет страницу — значение синхронизировано с Controls.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()

		await userEvent.click(canvas.getByRole('button', { name: '3' }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
		await waitFor(() => expect(canvas.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page'))

		await userEvent.click(canvas.getByRole('button', { name: 'Следующая страница' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(4)
	},
}

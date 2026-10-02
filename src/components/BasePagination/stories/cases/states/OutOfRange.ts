import { expect } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const OutOfRange: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Текущая страница вне диапазона (например, после фильтрации их стало меньше): «вперёд» заблокирована,',
					'«назад» ведёт на последнюю существующую страницу.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 7, total: 30 },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: 'Следующая страница' })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущая страница' }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
	},
}

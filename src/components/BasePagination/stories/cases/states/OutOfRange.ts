import { expect } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const OutOfRange: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Текущая страница вне диапазона (например, после фильтрации их стало меньше): текущей считается последняя существующая,',
					'на ней индикатор и `aria-current`, «вперёд» заблокирована, «назад» ведёт на предыдущую от неё.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 7, total: 30 },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: 'Страница 3' })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Следующая страница' })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущая страница' }))
		await expect(args.onChange).toHaveBeenCalledWith(2)
	},
}

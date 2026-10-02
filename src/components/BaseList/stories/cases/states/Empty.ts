import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пустой список: вместо строк — «Список пуст» (`empty-text` или слот `empty`), самого списка в DOM нет.',
			},
		},
	},
	args: { items: [], emptyText: 'Разделов пока нет' },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Разделов пока нет')).toBeVisible()
		await expect(canvas.queryByRole('listbox')).toBeNull()
	},
}

import type meta from '../BaseTransfer.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Нет строк: обе панели показывают `emptyText` (или слот `empty`), «Выбрать все» и кнопки недоступны.' },
		},
	},
	args: { items: [], modelValue: [], emptyText: 'Сотрудников пока нет' },
	play: async ({ canvas }) => {
		await expect(within(canvas.getByRole('group', { name: 'Доступно' })).getByText('Сотрудников пока нет')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' })).toBeDisabled()
	},
}

import { expect } from 'storybook/test'
import type meta from '../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённый перенос: строки не отмечаются, «Выбрать все», поиск и кнопки недоступны.' } },
	},
	args: { isDisabled: true, isSearchable: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('listbox', { name: 'Доступно' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getAllByRole('checkbox', { name: 'Выбрать все' })[0]).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' })).toBeDisabled()
	},
}

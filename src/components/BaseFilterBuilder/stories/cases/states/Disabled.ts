import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только просмотр: условия видны, но поля и кнопки неактивны.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		for (const field of canvas.getAllByRole('combobox')) await expect(field).toBeDisabled()
		await expect(canvas.getByRole('spinbutton', { name: 'Значение' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Добавить условие' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Удалить условие 1' })).toBeDisabled()
	},
}

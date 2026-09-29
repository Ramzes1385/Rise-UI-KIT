import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'

export const Readonly: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только чтение: значение видно, кнопок нет, стрелки не меняют число.' } } },
	args: { isReadonly: true, modelValue: 4 },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		await expect(canvas.getByRole('spinbutton', { name: 'Гостей' })).toHaveAttribute('readonly')
	},
}

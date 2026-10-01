import { expect } from 'storybook/test'
import type meta from '../BaseInputNumber.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: кнопки −/+ меняют значение на шаг, на границе кнопка отключается; фокус при нажатии остаётся в поле.',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await expect(field).toHaveAttribute('aria-valuenow', '2')
		await userEvent.click(field)
		await userEvent.click(canvas.getByRole('button', { name: 'Увеличить' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
		await userEvent.click(canvas.getByRole('button', { name: 'Уменьшить' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Уменьшить' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(1)
		await expect(canvas.getByRole('button', { name: 'Уменьшить' })).toBeDisabled()
		await expect(field).toHaveFocus()
	},
}

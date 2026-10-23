import type meta from '../BaseInplace.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клик открывает поле, Enter сохраняет.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Название проекта: Редизайн личного кабинета/ }))
		const field = canvas.getByRole('textbox', { name: 'Название проекта' })
		await expect(field).toHaveFocus()
		await userEvent.clear(field)
		await userEvent.type(field, 'Новый кабинет{Enter}')
		await expect(args.onSave).toHaveBeenLastCalledWith('Новый кабинет')
		await waitFor(() => expect(canvas.getByRole('button', { name: /Название проекта: Новый кабинет/ })).toHaveFocus())
	},
}

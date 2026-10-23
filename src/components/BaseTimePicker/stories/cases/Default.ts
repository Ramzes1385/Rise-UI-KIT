import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: список с 09:00 до 18:00 через 30 минут, клик выбирает.' } } },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await userEvent.click(field)
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(19))
		await userEvent.click(document.querySelectorAll<HTMLElement>('[role="option"]')[2])
		await expect(args.onChange).toHaveBeenLastCalledWith('10:00')
		await expect(field).toHaveValue('10:00')
	},
}

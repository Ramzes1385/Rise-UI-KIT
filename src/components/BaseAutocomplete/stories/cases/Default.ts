import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: ввод фильтрует города, совпадение выделено, клик выбирает.' } } },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.type(field, 'каз')
		const listbox = await waitFor(() => document.querySelector('[role="listbox"]') as HTMLElement)
		await waitFor(() => expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(1))
		await userEvent.click(listbox.querySelector('[role="option"]') as HTMLElement)
		await expect(args.onChange).toHaveBeenLastCalledWith('kzn')
		await expect(field).toHaveValue('Казань')
		await expect(field).toHaveAttribute('aria-expanded', 'false')
	},
}

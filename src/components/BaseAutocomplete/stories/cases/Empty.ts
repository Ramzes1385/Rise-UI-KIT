import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ничего не найдено: в списке — «Ничего не найдено» (слот `empty`), скринридер слышит то же.' } },
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox', { name: 'Город доставки' }), 'Лондон')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Ничего не найдено'))
	},
}

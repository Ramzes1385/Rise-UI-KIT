import { PEOPLE } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Typeahead: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поиск по первым буквам (APG Listbox): набранные подряд буквы переводят фокус на первую подходящую строку,',
					'через 500 мс набор сбрасывается; повтор одной буквы перебирает строки на неё по кругу.',
				].join('\n'),
			},
		},
	},
	args: { items: PEOPLE, label: 'Команда' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await userEvent.keyboard('ма')
		await expect(canvas.getByRole('option', { name: /Мария Кузнецова/ })).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await new Promise(resolve => setTimeout(resolve, 600))
		await userEvent.keyboard('о')
		await expect(canvas.getByRole('option', { name: /Олег Соколов/ })).toHaveFocus()
	},
}

import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAutocomplete.stories'

export const CustomValue: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Свой вариант (`isCustomAllowed`): набранный город, которого нет в списке, становится значением при выходе из поля',
					'или по Enter. Без `isCustomAllowed` такой текст заменился бы выбранным значением.',
				].join('\n'),
			},
		},
	},
	args: { isCustomAllowed: true, label: 'Город (можно свой)' },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город (можно свой)' })
		await userEvent.type(field, 'Тверь{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('Тверь')
		await expect(field).toHaveValue('Тверь')
	},
}

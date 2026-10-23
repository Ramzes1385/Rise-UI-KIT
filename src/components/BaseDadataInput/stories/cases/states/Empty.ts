import { emptySource } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Сервис ничего не нашёл — в списке «Ничего не найдено», набранный текст остаётся значением поля после ухода из него.',
			},
		},
	},
	args: { source: emptySource, debounce: 0 },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Организация' })
		await userEvent.type(field, 'несуществующая')
		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Ничего не найдено'))
	},
}

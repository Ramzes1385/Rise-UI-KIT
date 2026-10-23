import { pendingSource } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пока ответа нет, в списке «Загрузка...». Здесь источник не отвечает никогда — наберите три буквы.',
			},
		},
	},
	args: { source: pendingSource, debounce: 0 },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Организация' })
		await userEvent.type(field, 'ооо')
		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Загрузка'))
	},
}

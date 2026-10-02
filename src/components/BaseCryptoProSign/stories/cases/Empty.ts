import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пусто: документ не передан и ещё не выбран — поле «Документ» пустое, «Подписать» недоступна. Сертификат уже выбран.',
			},
		},
	},
	args: { data: undefined, fileName: '' },
	play: async ({ canvas }) => {
		await expect(await canvas.findByLabelText('Документ')).toHaveValue('')
		await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Сертификат' })).toHaveTextContent('Иванов Иван Иванович'))
		await expect(canvas.getByRole('button', { name: 'Подписать' })).toBeDisabled()
	},
}

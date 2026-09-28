import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Mask: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Маска ввода: `#` — цифра, `@` — буква, `*` — любой символ; литералы подставляются автоматически.',
					'Здесь — телефон `+7 (###) ###-##-##`: вводятся только цифры.',
				].join('\n'),
			},
		},
	},
	args: { label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', mask: '+7 (###) ###-##-##' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Телефон')
		await userEvent.type(field, '9161234567')
		await expect(field).toHaveValue('+7 (916) 123-45-67')
	},
}

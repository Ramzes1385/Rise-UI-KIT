import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' } },
	},
	args: {
		label: 'Причина возврата',
		placeholder: 'Опишите, что не так с товаром',
		error: 'Опишите причину возврата — без неё заявку не примут',
		isRequired: true,
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Причина возврата/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAttribute('aria-required', 'true')
		await expect(field).toHaveAccessibleDescription('Опишите причину возврата — без неё заявку не примут')
	},
}

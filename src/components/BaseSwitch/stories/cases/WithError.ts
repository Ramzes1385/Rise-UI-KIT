import { expect } from 'storybook/test'
import type meta from '../BaseSwitch.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ошибка: красная обводка трека и текст под подписью; переключатель помечен `aria-invalid` и описан текстом ошибки.',
			},
		},
	},
	args: {
		label: 'Согласие на обработку данных',
		isRequired: true,
		error: 'Без согласия мы не сможем создать аккаунт',
	},
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole('switch', { name: /Согласие на обработку данных/ })
		await expect(toggle).toHaveAttribute('aria-invalid', 'true')
		await expect(toggle).toHaveAttribute('aria-required', 'true')
		await expect(toggle).toHaveAccessibleDescription('Без согласия мы не сможем создать аккаунт')
	},
}

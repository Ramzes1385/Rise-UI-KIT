import { expect } from 'storybook/test'
import type meta from '../BaseRadio.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ошибка: круги с красной рамкой и текст под группой; группа помечена `aria-invalid` и описана текстом ошибки.',
			},
		},
	},
	args: { modelValue: '', name: 'delivery-error', isRequired: true, error: 'Выберите способ доставки' },
	play: async ({ canvas }) => {
		const group = canvas.getByRole('radiogroup', { name: /Способ доставки/ })
		await expect(group).toHaveAttribute('aria-invalid', 'true')
		await expect(group).toHaveAttribute('aria-required', 'true')
		await expect(group).toHaveAccessibleDescription('Выберите способ доставки')
	},
}

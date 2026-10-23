import { expect } from 'storybook/test'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' } },
	},
	args: { error: 'Выберите район, чтобы рассчитать доставку', isRequired: true },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: /Район доставки/ })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAttribute('aria-required', 'true')
		await expect(field).toHaveAccessibleDescription('Выберите район, чтобы рассчитать доставку')
	},
}

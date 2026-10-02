import { expect } from 'storybook/test'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' },
		},
	},
	args: { error: 'Выберите город, чтобы рассчитать доставку', isRequired: true },
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('combobox', { name: /Город доставки/ })
		await expect(trigger).toHaveAttribute('aria-invalid', 'true')
		await expect(trigger).toHaveAttribute('aria-required', 'true')
		await expect(trigger).toHaveAccessibleDescription('Выберите город, чтобы рассчитать доставку')
	},
}

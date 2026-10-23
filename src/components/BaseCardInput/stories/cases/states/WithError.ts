import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Общая ошибка группы `error` — например, ответ эквайера. Текст под полями описывает `fieldset` (`aria-describedby`), группа помечена `aria-invalid`.',
			},
		},
	},
	args: { error: 'Банк отклонил оплату: недостаточно средств' },
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Оплата картой' })
		await expect(group).toHaveAccessibleDescription('Банк отклонил оплату: недостаточно средств')
		await expect(group).toHaveAttribute('aria-invalid', 'true')
	},
}

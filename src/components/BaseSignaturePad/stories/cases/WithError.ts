import { expect } from 'storybook/test'
import type meta from '../BaseSignaturePad.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка поля, текст под ним связан с группой через `aria-describedby`.' } },
	},
	args: { error: 'Распишитесь, чтобы подтвердить заказ' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Подпись клиента' })).toHaveAccessibleDescription(
			'Распишитесь, чтобы подтвердить заказ',
		)
	},
}

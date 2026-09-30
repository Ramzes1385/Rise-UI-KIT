import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Расчётный счёт не сходится с БИК: ошибка видна сразу, потому что введены все 20 цифр.' } },
	},
	args: { kind: 'account', bik: '044525225', modelValue: '40702810400000000001' },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Расчётный счёт')
		await expect(field).toHaveAccessibleDescription('Счёт не подходит к БИК')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}

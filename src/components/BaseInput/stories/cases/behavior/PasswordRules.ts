import { expect } from 'storybook/test'
import type meta from '../../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const PasswordRules: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Правила пароля под полем: выполненные отмечаются зелёным по мере ввода.' } } },
	args: {
		label: 'Новый пароль',
		type: 'password',
		placeholder: '',
		modelValue: 'rise2025',
		passwordRules: [
			{ key: 'length', label: 'Не меньше 8 символов', validate: (value: string) => value.length >= 8 },
			{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
			{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /[A-ZА-ЯЁ]/.test(value) },
		],
	},
	play: async ({ canvasElement }) => {
		const rules = canvasElement.querySelectorAll('.base-input__password-rule')
		await expect(rules).toHaveLength(3)
		await expect(canvasElement.querySelectorAll('.base-input__password-rule--valid')).toHaveLength(2)
	},
}

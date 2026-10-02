import { expect } from 'storybook/test'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет фона и текста поля через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.',
			},
		},
	},
	args: { modelValue: 'kazan', color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } } },
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(getComputedStyle(trigger).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}

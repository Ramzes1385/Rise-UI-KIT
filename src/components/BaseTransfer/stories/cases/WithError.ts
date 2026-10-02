import { expect } from 'storybook/test'
import type meta from '../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под панелями связан с обеими через `aria-describedby` вместе с подсказкой клавиш.' } },
	},
	args: { error: 'Добавьте хотя бы двух участников' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Выбрано' })).toHaveAccessibleDescription(/Добавьте хотя бы двух участников/)
	},
}

import { expect } from 'storybook/test'
import type meta from '../BaseEditor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Пустой редактор: виден плейсхолдер, скринридер получает его через `aria-placeholder`.' } },
	},
	args: { modelValue: '', placeholder: 'Опишите задачу: что сделать и к какому сроку' },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.textContent).toBe('')
		await expect(textbox).toHaveAttribute('aria-placeholder', 'Опишите задачу: что сделать и к какому сроку')
	},
}

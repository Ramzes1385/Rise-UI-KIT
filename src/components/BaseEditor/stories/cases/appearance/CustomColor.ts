import { expect } from 'storybook/test'
import type meta from '../../BaseEditor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон области текста, `text.base` — цвет текста и заголовков.',
					'Тулбар остаётся на фоне варианта, его кнопки — нейтральные вложенные компоненты, их цвет не меняется в любой теме.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: '<h3>Заметки к встрече</h3><p>Фон и текст задаёт проп <code>color</code>, кнопки тулбара остаются нейтральными.</p>',
		color: { bg: { base: '#fffbeb' }, text: { base: '#78350f' } },
	},
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(getComputedStyle(textbox).backgroundColor).toBe('rgb(255, 251, 235)')
		await expect(getComputedStyle(textbox).color).toBe('rgb(120, 53, 15)')
		const root = textbox.closest('.base-editor') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).not.toBe('rgb(255, 251, 235)')
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await expect(getComputedStyle(bold).backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(getComputedStyle(bold).color).not.toBe('rgb(120, 53, 15)')
	},
}

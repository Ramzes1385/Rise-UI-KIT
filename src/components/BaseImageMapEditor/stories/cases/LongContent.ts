import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseImageMapEditor.stories'
import { LONG_CONTENT_MAP, LONG_LAYER_TITLE, LONG_TITLE } from '../shared'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия объектов, этажа и группы: строки списков обрезаются многоточием, полное название — в доступном имени кнопки и в поле «Название».',
			},
		},
	},
	args: { modelValue: LONG_CONTENT_MAP },
	play: async ({ canvas }) => {
		const item = canvas.getByRole('button', { name: `${LONG_TITLE} Точка` })
		await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth + 1)
		const layer = canvas.getByRole('button', { name: LONG_LAYER_TITLE })
		await expect(layer.scrollWidth).toBeLessThanOrEqual(layer.clientWidth + 1)
		await expect(canvas.getByLabelText('Название этажа')).toHaveValue(LONG_LAYER_TITLE)
	},
}

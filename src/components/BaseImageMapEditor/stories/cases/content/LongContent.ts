import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { LONG_CONTENT_MAP, LONG_GROUP_TITLE, LONG_LAYER_TITLE, LONG_TITLE } from '../../shared'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия объектов, этажа и группы: строки списков обрезаются многоточием, полное название — в доступном имени кнопки и в поле «Название»; рамка группы переносит название и не расширяет панель.',
			},
		},
	},
	args: { modelValue: LONG_CONTENT_MAP },
	play: async ({ canvas, canvasElement }) => {
		const item = canvas.getByRole('button', { name: `${LONG_TITLE} Точка` })
		await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth + 1)
		const layer = canvas.getByRole('button', { name: LONG_LAYER_TITLE })
		await expect(layer.scrollWidth).toBeLessThanOrEqual(layer.clientWidth + 1)
		await expect(canvas.getByLabelText('Название этажа')).toHaveValue(LONG_LAYER_TITLE)

		const panel = canvasElement.querySelector('.base-image-map-editor__panel') as HTMLElement
		await expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth + 1)
		const group = canvas.getByRole('group', { name: LONG_GROUP_TITLE })
		await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth + 1)
		await expect(group.getBoundingClientRect().right).toBeLessThanOrEqual(panel.getBoundingClientRect().right + 1)
	},
}

import { expect } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-medium story-stack">
			<strong>Фотоотчёт с объекта</strong>
			<span>Снимки предварительные: логотип студии на слое защищает их от повторной публикации.</span>
		</div>
	</BaseWatermark>
`

export const Image: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Картинка вместо текста: `image` и `width` (высота — по пропорциям, либо `height`). Для `data:`-адреса canvas поворачивает',
					'картинку; чужой адрес без CORS-заголовков повторяется без поворота и расстояния.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark'] }),
		},
	},
	args: { content: undefined, image: placeholderImage({ width: 240, height: 150 }), width: 96, opacity: 0.25 },
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await waitForPattern(watermarkLayer(canvasElement))
		await expect(canvas.getByText('Фотоотчёт с объекта')).toBeVisible()
	},
}

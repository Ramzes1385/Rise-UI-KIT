import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const failingRenderer = (): never => {
	throw new Error('WebGL недоступен')
}

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" :renderer-factory="failingRenderer" />
	</div>
`

export const RendererFallback: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Рендерер не создался (здесь `rendererFactory` бросает ошибку; в жизни — нет WebGL, контекст отклонён): карта сама показывает план в 2D, объявляет это сообщением `role="status"` и шлёт событие `fallback` с причиной `error` (без WebGL — `unsupported`).',
			},
			source: storySource({
				template,
				imports: ['BaseImageMap3D'],
				script: "const failingRenderer = () => {\n\tthrow new Error('WebGL недоступен')\n}",
			}),
		},
		controls: { exclude: ['rendererFactory', 'view'] },
	},
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { data: { failingRenderer } }),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		await waitFor(() => expect(canvas.getByText('Не удалось запустить 3D — показан план')).toHaveAttribute('role', 'status'))
		await expect(args.onFallback).toHaveBeenCalledWith('error')
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		await expect(await canvas.findByRole('button', { name: 'Магазин 101' })).toBeVisible()
	},
}

import { MALL_FLOOR_MODEL } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:active="active" />
	</div>
`

export const Glb: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Этаж из GLB-модели (`layer.model`): меши магазинов, лестницы и лифта названы id объектов карты и подсвечиваются их цветами — выбранный магазин окрашен цветом `active`. Модель сгенерирована скриптом `scripts/generate-map3d-demo.mjs`. DRACO, KTX2 и meshopt приложение подключает само через `configureLoader`.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { active: 'string | null' },
			}),
		},
	},
	args: { data: MALL_FLOOR_MODEL, active: 'f1-shop-2' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const region = canvas.getByRole('group', { name: 'Этаж 1' })
		await tabTo(region, userEvent)
		await expect(region).toHaveFocus()
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const modelUrl = new URL(MALL_FLOOR_MODEL.layers[0].model?.url ?? '', location.href).href
		await waitFor(() => expect(performance.getEntriesByName(modelUrl)).not.toHaveLength(0), { timeout: 5000 })
		await new Promise(resolve => setTimeout(resolve, 300))
		await expect(args.onFallback).not.toHaveBeenCalled()
		await expect(canvasElement.querySelector('canvas')).not.toBeNull()
		await expect(canvas.getByRole('status')).toHaveTextContent('')
	},
}

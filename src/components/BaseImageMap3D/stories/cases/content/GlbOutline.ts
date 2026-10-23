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

export const GlbOutline: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Контур по рёбрам мешей GLB-модели (`data.scene3d.outline: true`): линии `EdgesGeometry` проводятся там, где поверхность поворачивает больше чем на 30°, и окрашиваются в цвет объекта по состоянию. Для моделей по умолчанию контура нет — форму задаёт сама модель; для выдавленных фигур контур включён, пока `outline` не `false`.',
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
	args: { data: { ...MALL_FLOOR_MODEL, scene3d: { outline: true } }, active: 'f1-shop-2' },
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
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		await expect(args.onFallback).not.toHaveBeenCalled()
	},
}

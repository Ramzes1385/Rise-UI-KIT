import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { layer: 'layer', active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" v-model:active="active" />
	</div>
`

export const Floors3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Торговый центр в три этажа из того же JSON, что у BaseImageMap: пол каждого этажа — картинка его SVG-плана, магазины, лестница и лифт выдавлены из элементов SVG по `elementId`. `layerMode: stack` — этажи стопкой, неактивные полупрозрачны; переключатель этажей — стрелками внутри группы «Этажи».',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string', active: 'string | null' },
			}),
		},
	},
	args: { layer: 'floor-1', layerMode: 'stack', active: 'f1-shop-1' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const floors = canvas.getByRole('radiogroup', { name: 'Этажи' })
		const first = canvas.getByRole('radio', { name: '1' })
		await tabTo(first, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		const second = canvas.getByRole('radio', { name: '2' })
		await waitFor(() => expect(second).toBeChecked())
		await expect(second).toHaveFocus()
		await expect(floors).toBeVisible()
	},
}

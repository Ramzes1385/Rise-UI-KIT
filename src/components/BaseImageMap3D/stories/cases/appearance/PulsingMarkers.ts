import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

const MODELS = { layer: 'layer' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" />
	</div>
`

export const PulsingMarkers: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`isPulsing` включает пульсацию всех меток `point` над сценой, у отдельной точки — поле `isPulsing` в данных. Кольцо расходится от метки по `transform` и `opacity` на токенах движения кита; при «уменьшить движение» метки неподвижны.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_FLOORS, isPulsing: true, layer: 'floor-1', height: '320px' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('.base-image-map-3d__point--pulsing')).not.toBeNull())
		await tabTo(canvas.getByRole('group', { name: 'Этаж 1' }), userEvent)
		await expect(canvas.getByRole('group', { name: 'Этаж 1' })).toHaveFocus()
	},
}

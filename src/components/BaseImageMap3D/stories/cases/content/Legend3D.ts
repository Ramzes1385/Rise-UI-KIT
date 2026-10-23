import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_MALL } from '@components/BaseImageMap/stories/fixtures'

const MODELS = { layer: 'layer' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" />
	</div>
`

export const Legend3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Легенда групп (`hasLegend`) под областью карты — тот же список образцов цвета и значков, что у BaseImageMap, с тем же именем «Легенда» для скринридера. Цвета берутся из `data.groups`; оформление — `customClass.legend` и части `legend`, `legend-item`, `swatch`.',
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
	args: { data: IMAGE_MAP_MALL, hasLegend: true, layer: 'floor-1', height: '320px' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const legend = within(canvas.getByRole('list', { name: 'Легенда' }))
		await expect(legend.getAllByRole('listitem').map(item => item.textContent?.trim())).toEqual([
			'Кафе и рестораны',
			'Магазины',
			'Сервис',
		])
		await tabTo(canvas.getByRole('group', { name: 'Этаж 1' }), userEvent)
		await expect(canvas.getByRole('group', { name: 'Этаж 1' })).toHaveFocus()
	},
}

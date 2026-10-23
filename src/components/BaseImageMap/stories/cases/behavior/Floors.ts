import { expect, waitFor } from 'storybook/test'
import { IMAGE_MAP_FLOORS } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active', layer: 'layer' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap v-bind="args" v-model:active="active" v-model:layer="layer" />
	</div>
`

export const Floors: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Торговый центр в три этажа на своём SVG: объекты `svg` — элементы плана по `id`, точка «Справочная». Этаж — переключателем (`v-model:layer`) или лифтом (`action: 'layer'`).",
					'SVG очищается по белому списку, id элементов получают префикс экземпляра — два одинаковых плана на странице не конфликтуют.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap'],
				models: MODELS,
				types: { active: 'string | null', layer: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_FLOORS, layer: 'floor-1' },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const floors = canvas.getByRole('radiogroup', { name: 'Этажи' })
		const first = canvas.getByRole('radio', { name: '1' })
		await expect(first).toBeChecked()
		await tabTo(first, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: '2' })).toBeChecked()
		await expect(canvas.getByRole('region', { name: 'Этаж 2' })).toBeVisible()
		const lift = await canvas.findByRole('button', { name: 'Лифт на этаж 3' })
		await userEvent.click(lift)
		await waitFor(() => expect(canvas.getByRole('radio', { name: '3' })).toBeChecked())
		await expect(floors).toBeVisible()
	},
}

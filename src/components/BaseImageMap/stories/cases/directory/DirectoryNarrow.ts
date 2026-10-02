import { IMAGE_MAP_MALL } from '../../fixtures'
import { expect, within } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseImageMap v-bind="args" />
	</div>
`

export const DirectoryNarrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Карта уже 640 px (здесь 360 px, как на телефоне): список уходит под карту и прокручивается в пределах 420 px. Раскладка зависит от ширины самой карты (container query), а не окна.',
			},
			source: storySource({ template, imports: ['BaseImageMap'] }),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, hasFilters: false, hasLegend: true },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const directory = canvas.getByRole('complementary', { name: 'Список объектов' })
		const map = canvasElement.querySelector('.base-image-map__viewport')
		await expect(directory.getBoundingClientRect().top).toBeGreaterThanOrEqual(map!.getBoundingClientRect().bottom)
		await expect(directory.getBoundingClientRect().height).toBeLessThanOrEqual(420)
		await expect(within(canvas.getByRole('list', { name: 'Легенда' })).getAllByRole('listitem')).toHaveLength(3)
	},
}

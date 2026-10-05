import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { MAP_VARIANTS } from '../../../types/BaseMap.types'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-for="variant in MAP_VARIANTS" :key="variant" v-bind="args" :variant="variant" :aria-label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: '`default` — рамка и скругление, `outline` — акцентная рамка на фоне страницы, `ghost` — без рамки и скругления.',
			},
			source: storySource({ template, imports: ['BaseMap', 'MAP_VARIANTS'] }),
		},
		controls: { include: ['sizeScale', 'height'] },
	},
	args: { height: '220px' },
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { MAP_VARIANTS } }),
		template,
	}),
}

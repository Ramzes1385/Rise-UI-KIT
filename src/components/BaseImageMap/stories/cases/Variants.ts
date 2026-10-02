import type meta from '../BaseImageMap.stories'
import BaseImageMap from '../../ui/BaseImageMap.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_VARIANTS } from '../../types/BaseImageMap.types'

const template = `<div class="story-row"><BaseImageMap v-for="variant in IMAGE_MAP_VARIANTS" :key="variant" v-bind="args" :variant="variant"/></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseImageMap', 'IMAGE_MAP_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { data: { IMAGE_MAP_VARIANTS } }),
		template,
	}),
}

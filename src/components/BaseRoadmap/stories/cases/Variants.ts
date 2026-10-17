import type meta from '../BaseRoadmap.stories'
import BaseRoadmap from '../../ui/BaseRoadmap.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ROADMAP_VARIANTS } from '../../types/BaseRoadmap.types'

const template = `<div class="story-row"><BaseRoadmap v-for="variant in ROADMAP_VARIANTS" :key="variant" v-bind="args" :variant="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseRoadmap', 'ROADMAP_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { data: { ROADMAP_VARIANTS } }),
		template,
	}),
}

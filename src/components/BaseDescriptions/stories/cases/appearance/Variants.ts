import { SHORT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'
import { DESCRIPTIONS_VARIANTS } from '../../../types/BaseDescriptions.types'

const template = `<div class="story-stack"><BaseDescriptions v-for="variant in DESCRIPTIONS_VARIANTS" :key="variant" v-bind="args" :variant="variant" :title="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	args: { items: SHORT },
	parameters: {
		docs: {
			description: {
				story: 'Все варианты оформления: default — рамка, soft — подложка, outline — заметная рамка, ghost — без рамки и отступов.',
			},
			source: storySource({ template, imports: ['BaseDescriptions', 'DESCRIPTIONS_VARIANTS'] }),
		},
		controls: { include: ['sizeScale', 'layout', 'columns'] },
	},
	render: args => ({
		components: { BaseDescriptions },
		setup: useStorySetup(args, { data: { DESCRIPTIONS_VARIANTS } }),
		template,
	}),
}

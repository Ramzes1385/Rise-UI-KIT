import type meta from '../BaseTransfer.stories'
import BaseTransfer from '../../ui/BaseTransfer.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TRANSFER_VARIANTS } from '../../types/BaseTransfer.types'

const template = `<div class="story-stack"><BaseTransfer v-for="variant in TRANSFER_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления панелей. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseTransfer', 'TRANSFER_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { height: 160 },
	render: args => ({
		components: { BaseTransfer },
		setup: useStorySetup(args, { data: { TRANSFER_VARIANTS } }),
		template,
	}),
}

import type meta from '../BaseCode.stories'
import BaseCode from '../../ui/BaseCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CODE_VARIANTS } from '../../types/BaseCode.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-row"><BaseCode v-for="variant in CODE_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseCode', 'CODE_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args, { data: { CODE_VARIANTS } }),
		template,
	}),
}

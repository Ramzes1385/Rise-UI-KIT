import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { LIST_VARIANTS } from '../../../types/BaseList.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-row"><BaseList v-for="variant in LIST_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseList', 'LIST_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { data: { LIST_VARIANTS } }),
		template,
	}),
}

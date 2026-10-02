import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTreeSelect from '../../../ui/BaseTreeSelect.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TREE_SELECT_VARIANTS } from '../../../types/BaseTreeSelect.types'

const template = `<div class="story-row"><BaseTreeSelect v-for="variant in TREE_SELECT_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseTreeSelect', 'TREE_SELECT_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseTreeSelect },
		setup: useStorySetup(args, { data: { TREE_SELECT_VARIANTS } }),
		template,
	}),
}

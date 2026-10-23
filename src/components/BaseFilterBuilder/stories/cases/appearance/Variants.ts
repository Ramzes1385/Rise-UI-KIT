import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { FILTER_BUILDER_VARIANTS } from '../../../types/BaseFilterBuilder.types'

const variants = FILTER_BUILDER_VARIANTS

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 720px">
		<BaseFilterBuilder v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'default — панель в рамке, soft — на подложке, outline — рамка без фона, ghost — без рамки и отступов.' },
			source: storySource({
				template,
				imports: ['BaseFilterBuilder'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseFilterBuilder },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}

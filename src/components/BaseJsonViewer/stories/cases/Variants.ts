import { SMALL } from '../shared'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseJsonViewer from '../../ui/BaseJsonViewer.vue'
import { JSON_VIEWER_VARIANTS } from '../../types/BaseJsonViewer.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = JSON_VIEWER_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 280px">
		<BaseJsonViewer v-for="variant in variants" :key="variant" v-bind="args" :value="small" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: default — рамка, soft — подложка без рамки, outline — рамка accented, ghost — без рамки и фона.',
			},
			source: storySource({
				template,
				imports: ['BaseJsonViewer'],
				script: [`const variants = ${literal(variants)}`, `const small = ${literal(SMALL)}`].join('\n'),
				omit: ['value', 'variant', 'label'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseJsonViewer },
		setup: useStorySetup(args, { data: { variants, small: SMALL } }),
		template,
	}),
}

import type meta from '../BaseTextDiff.stories'
import BaseTextDiff from '../../ui/BaseTextDiff.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SHORT_AFTER, SHORT_BEFORE } from '../shared'
import { TEXT_DIFF_VARIANTS } from '../../types/BaseTextDiff.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const before = SHORT_BEFORE

const after = SHORT_AFTER

const template = `
	<div class="story-grid" style="--story-grid-min: 300px">
		<BaseTextDiff v-for="variant in TEXT_DIFF_VARIANTS" :key="variant" v-bind="args" :before="before" :after="after" :variant="variant" :label="variant" />
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
				imports: ['BaseTextDiff', 'TEXT_DIFF_VARIANTS'],
				script: [`const before = ${literal(before)}`, `const after = ${literal(after)}`].join('\n'),
			}),
		},
		controls: { include: ['sizeScale', 'mode'] },
	},
	render: args => ({
		components: { BaseTextDiff },
		setup: useStorySetup(args, { data: { TEXT_DIFF_VARIANTS, before, after } }),
		template,
	}),
}

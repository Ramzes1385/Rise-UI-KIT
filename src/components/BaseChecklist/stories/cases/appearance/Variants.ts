import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseChecklist from '../../../ui/BaseChecklist.vue'
import { CHECKLIST_VARIANTS } from '../../../types/BaseChecklist.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = CHECKLIST_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px">
		<BaseChecklist v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :title="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'default — карточка в рамке, soft — на подложке, outline — рамка без фона, ghost — без рамки и отступов.',
			},
			source: storySource({
				template,
				imports: ['BaseChecklist'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'title'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseChecklist },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}

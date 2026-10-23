import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { CHECKBOX_GROUP_VARIANTS } from '../../../types/BaseCheckboxGroup.types'

const variants = CHECKBOX_GROUP_VARIANTS

const template = `
	<div class="story-stack">
		<BaseCheckboxGroup v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты флажков: `default`, `ghost`, `outline`, `shadow`, `soft` — как у BaseCheckbox.' },
			source: storySource({
				template,
				imports: ['BaseCheckboxGroup'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label'],
			}),
		},
		controls: { include: ['sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label'] }),
		template,
	}),
}

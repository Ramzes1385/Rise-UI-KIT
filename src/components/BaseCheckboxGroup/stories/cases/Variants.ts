import type meta from '../BaseCheckboxGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseCheckboxGroup from '../../ui/BaseCheckboxGroup.vue'
import { CHECKBOX_GROUP_VARIANTS } from '../../types/BaseCheckboxGroup.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты флажков: `default`, `ghost`, `outline`, `shadow`, `soft` — как у BaseCheckbox.' } },
		controls: { include: ['sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: CHECKBOX_GROUP_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseCheckboxGroup v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

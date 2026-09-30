import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTimePicker from '../../ui/BaseTimePicker.vue'
import { TIME_PICKER_VARIANTS } from '../../types/BaseTimePicker.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = TIME_PICKER_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 160px;">
		<BaseTimePicker v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" model-value="14:30" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты поля — как у BaseInput.' },
			source: storySource({
				template,
				imports: ['BaseTimePicker'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label', 'modelValue'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseTimePicker },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label', 'modelValue'] }),
		template,
	}),
}

import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { INPUT_VARIANTS } from '@components/BaseInput'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { literal, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const variants = INPUT_VARIANTS

const state = { values: Object.fromEntries(INPUT_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)])) }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseDatePicker
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:input-variant="variant"
			:label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Варианты поля — те же, что у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`.',
			},
			source: storySource({
				template,
				imports: ['BaseDatePicker'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, Date | null>' },
				omit: ['modelValue', 'label', 'inputVariant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'label', 'inputVariant', 'onUpdate:modelValue'] }),
		template,
	}),
}

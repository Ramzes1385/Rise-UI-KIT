import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { CASCADER_VARIANTS } from '../../../types/BaseCascader.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = CASCADER_VARIANTS

const state = { values: { default: ['msk-region', 'cao', 'tverskoy'] } }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px;">
		<BaseCascader
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Шесть вариантов поля — как у `BaseSelect`: `default`, `outline`, `soft`, `ghost`, `shadow`, `underline`.',
			},
			source: storySource({
				template,
				imports: ['BaseCascader'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string[]>' },
				omit: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCascader },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}

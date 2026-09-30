import type { SearchArgs } from '../../shared'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SEARCH_VARIANTS } from '../../../types/BaseSearch.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = SEARCH_VARIANTS

const state = { values: { default: 'Лисья тропа' } }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseSearch
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:placeholder="variant" />
	</div>
`

export const Variants: StoryObj<SearchArgs> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'hasIcon'] },
		docs: {
			description: {
				story: 'Семь вариантов поля — как у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`.',
			},
			source: storySource({
				template,
				imports: ['BaseSearch'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['modelValue', 'variant', 'placeholder', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'variant', 'placeholder', 'onUpdate:modelValue'] }),
		template,
	}),
}

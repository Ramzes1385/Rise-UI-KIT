import { ref } from 'vue'
import type { SearchArgs } from '../../shared'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SEARCH_VARIANTS } from '../../../types/BaseSearch.types'

export const Variants: StoryObj<SearchArgs> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'hasIcon'] },
		docs: {
			description: {
				story: 'Семь вариантов поля — как у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`.',
			},
			source: {
				code: SEARCH_VARIANTS.map(variant => `<BaseSearch v-model="query" :results="results" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'placeholder', 'onUpdate:modelValue']),
			variants: SEARCH_VARIANTS,
			values: ref<Record<string, string>>({ default: 'Лисья тропа' }),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseSearch
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:placeholder="variant" />
			</div>
		`,
	}),
}

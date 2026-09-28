import { ref } from 'vue'
import type { SearchArgs } from '../shared'
import BaseSearch from '../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<SearchArgs> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px; иконка, кнопка очистки и список масштабируются вместе.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSearch v-model="query" :results="results" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'placeholder', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>({ md: 'Лисья тропа' }),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseSearch
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}

import { ref } from 'vue'
import { MODEL_KEYS } from '../shared'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePagination from '../../ui/BasePagination.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: кнопки 24, 28, 32, 36 и 40px — как у BaseButton того же размера.' },
			source: {
				code: SIZE_PRESETS.map(p => `<BasePagination v-model="page" :total="120" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			pages: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 5]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BasePagination v-bind="props" v-model="pages[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

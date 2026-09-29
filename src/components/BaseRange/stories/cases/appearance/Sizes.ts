import { ref } from 'vue'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: трек 4.5–7.5px, бегунок 12–20px и область нажатия масштабируются вместе.' },
			source: { code: SIZE_PRESETS.map(p => `<BaseRange v-model="volume" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'ariaLabel', 'thumb', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 60]))),
		}),
		template: `
			<div class="story-stack story-narrow">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseRange v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}

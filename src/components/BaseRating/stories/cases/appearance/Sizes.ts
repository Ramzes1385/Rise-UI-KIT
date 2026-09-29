import { ref } from 'vue'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: звезда 15, 17.5, 20, 22.5 и 25px; коробка вариантов — 24–40px, как поле того же размера.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseRating v-model="rating" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 3]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseRating v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

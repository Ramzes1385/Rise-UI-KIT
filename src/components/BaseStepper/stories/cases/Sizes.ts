import { ref } from 'vue'
import type meta from '../BaseStepper.stories'
import { MODEL_KEYS, SLOT_KEYS } from '../shared'
import BaseStepper from '../../ui/BaseStepper.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['shape', 'orientation'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: индикатор 21–35px, подписи и линия масштабируются пропорционально.' },
			source: {
				code: SIZE_PRESETS.map(p => `<BaseStepper v-model="step" :items="items" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, ...SLOT_KEYS, 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			steps: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 2]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseStepper v-bind="props" v-model="steps[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

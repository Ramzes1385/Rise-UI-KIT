import { ref } from 'vue'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../../ui/BaseDatePicker.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['inputVariant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: поле 24, 28, 32, 36 и 40px — как кнопка и `BaseInput` того же размера; панель масштабируется так же.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseDatePicker v-model="date" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, Date | null>>({}),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseDatePicker
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

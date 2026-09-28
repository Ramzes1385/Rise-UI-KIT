import { ref } from 'vue'
import type meta from '../BaseInput.stories'
import BaseInput from '../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px — такая же, как у кнопки того же размера.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseInput v-model="value" :size-scale="${p.sizeScale}" placeholder="${p.name}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseInput },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseInput
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
